string robot_id
string msg_type      # REQUEST, GRANT, DENY, BID, BLOCKED_AISLE, RELEASE, SAFETY_EVENT
string content       # e.g., "REQUESTED Intersection A", "GRANTED Intersection A", "BID $4.50 for Task X"
string topic_source  # e.g., "/fleet/intersection_reservations"
string status_level  # INFO, WARNING, SUCCESS, ERROR
builtin_interfaces/Time timestamp
