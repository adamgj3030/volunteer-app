from app.imports import *
from sqlalchemy import asc, desc

def query_handler(model, filters_dict = {}, filters=None, date_column=None):
    """
    Generic query handler for retrieving data from the database.
    
    :param query: SQLAlchemy query object
    :param model: SQLAlchemy model class
    :param filters: Optional filters to apply to the query
    :param order_by: Optional ordering for the results
    :return: List of results or empty list if no results found
    """
    filters_dict = filters_dict or {}
    filters = filters or []
    query = model.query

    for key, value in filters_dict.items():
        if value in ["start_date", "end_date", "limit", "offset", "sort", "order"]:
            continue

        if hasattr(model, key) and value is not None:
            col = getattr(model, key)
            if isinstance(value, str) and col.type.python_type == str:
                filters.append(col.ilike(f"%{value}%"))
            else:
                filters.append(col == value)

    # Date range filtering
    if date_column and hasattr(model, date_column):
        col = getattr(model, date_column)
        start = filters_dict.get("start_date")
        end = filters_dict.get("end_date")

        if start:
            filters.append(col >= datetime.strptime(start, "%m-%d-%Y"))
        if end:
            filters.append(col <= datetime.strptime(end, "%m-%d-%Y"))

        # Apply filters
        if filters:
            query = query.filter(*filters)

        # Sorting
        sort_col = filters_dict.get("sort")
        order = filters_dict.get("order", "asc").lower()

        if sort_col and hasattr(model, sort_col):
            sort_attr = getattr(model, sort_col)
            query = query.order_by(asc(sort_attr) if order == "asc" else desc(sort_attr))

        # Pagination
        limit = int(filters_dict.get("limit", 0)) if filters_dict.get("limit") else None
        offset = int(filters_dict.get("offset", 0)) if filters_dict.get("offset") else None

        if isinstance(limit, int) and limit > 0:
            query = query.limit(limit)
        if isinstance(offset, int) and offset >= 0:
            query = query.offset(offset)

        return query.all()