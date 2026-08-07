from slowapi import Limiter
from slowapi.util import get_remote_address

# In-memory, per-process store — correct for a single Cloud Run instance.
# If this ever runs with >1 replica, per-IP counts stop being shared across
# instances; switch to a Redis storage_uri at that point.
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
