
from backend.app import create_app


app = create_app()

if __name__ == "__main__":
    # Run by DevConfig by default
    app.run(debug=True)