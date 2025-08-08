from dataclasses import dataclass
from typing import Optional


@dataclass
class ConnectionParams:
    db_type: str
    host: str
    port: int
    username: str
    password: str
    database: Optional[str] = None
    catalog: Optional[str] = None
    schema: Optional[str] = None
    table: Optional[str] = None