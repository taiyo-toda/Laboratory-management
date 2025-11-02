def changestatus(account, new_status):
    """
    アカウントのステータスを変更する関数。

    Parameters:
    account (Account): ステータスを変更するアカウントオブジェクト
    new_status (str): 新しいステータス ("inroom", "offline", "berightback", "nearby" など)

    Returns:
    None
    """
    valid_statuses = ["inroom", "offline", "berightback", "nearby"]
    if new_status not in valid_statuses:
        raise ValueError(f"Invalid status: {new_status}. Valid statuses are: {valid_statuses}")

    account.status = new_status
    db.session.commit()