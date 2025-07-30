import os
import uuid
import pytest
from sqlalchemy import create_engine, text, event
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import scoped_session, sessionmaker


# --- session-wide PostgreSQL service ---------------------------
@pytest.fixture(scope="session")
def _postgres_url(docker_services):
    port = docker_services.port_for("postgres_test", 5432)
    base_url = f"postgresql://test_user:test_pass@localhost:{port}/postgres"
    
    def _ready() -> bool:
        try:
            eng = create_engine(base_url, isolation_level="AUTOCOMMIT")
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except OperationalError:
            return False

    docker_services.wait_until_responsive(timeout=30.0, pause=0.5, check=_ready)

    db_name = f"test_{uuid.uuid4().hex}"
    eng = create_engine(base_url, isolation_level="AUTOCOMMIT")
    with eng.connect() as conn:
        conn.execute(text(f'CREATE DATABASE "{db_name}"'))
    eng.dispose()

    test_url = f"postgresql://test_user:test_pass@localhost:{port}/{db_name}"
    os.environ["DATABASE_URL"] = test_url
    yield test_url

    eng = create_engine(base_url, isolation_level="AUTOCOMMIT")
    with eng.connect() as conn:
        conn.execute(
            text("SELECT pg_terminate_backend(pid) "
                 "FROM pg_stat_activity WHERE datname = :dname"),
            {"dname": db_name},
        )
        conn.execute(text(f'DROP DATABASE "{db_name}"'))
    eng.dispose()


@pytest.fixture(scope="session")
def app(_postgres_url):
    from app import create_app
    return create_app("app.config.TestConfig")


@pytest.fixture(scope="session")
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def db_session(app):
    """
    For each test:
      - open a connection + outer transaction
      - bind a Session to that connection
      - start a *nested* transaction (SAVEPOINT)
      - whenever code calls session.commit(), the SAVEPOINT is released -> we
        auto-start a new SAVEPOINT so tests stay isolated
    """
    from app import db as _db

    with app.app_context():
        _db.create_all()

        # 1) One connection + outer transaction for the test
        connection = _db.engine.connect()
        outer_tx = connection.begin()

        # 2) Bind a session to this connection
        SessionFactory = sessionmaker(bind=connection)
        TestingSession = scoped_session(SessionFactory)
        _db.session = TestingSession  # make your app use this session

        # 3) Begin the first SAVEPOINT using the *session* (important)
        TestingSession.begin_nested()

        # 4) If the nested transaction ends (because app code called commit),
        #    immediately start a new SAVEPOINT so the test remains isolated.
        @event.listens_for(TestingSession(), "after_transaction_end")
        def _restart_savepoint(sess, trans):
            # if the transaction that just ended was nested, and its parent
            # is the outer transaction (not nested), reopen a new SAVEPOINT
            if trans.nested and not trans._parent.nested:
                try:
                    sess.begin_nested()
                except Exception:
                    # If connection died mid-teardown, ignore to avoid noisy
                    # errors masking the real failure.
                    pass

        try:
            yield TestingSession
        finally:
            # Teardown in the right order
            try:
                TestingSession.remove()
            finally:
                try:
                    if outer_tx.is_active:
                        outer_tx.rollback()
                finally:
                    try:
                        connection.close()
                    except Exception:
                        pass
