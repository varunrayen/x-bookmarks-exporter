from dagster import asset

@asset
def my_first_asset():
    """
    This is my first asset
    """
    return [1, 2, 3]
