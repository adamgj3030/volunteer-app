from app.imports import *
from app.models import Events, UrgencyEnum

events_bp = Blueprint('events', __name__)

@events_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Events.query.get(event_id)
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    return jsonify({
        "event_id": event.event_id,
        "name": event.name,
        "description": event.description,
        "date": event.date.isoformat(),
        "address": event.address,
        "city": event.city,
        "state_id": event.state_id,
        "zipcode": event.zipcode,
        "urgency": event.urgency.name,
        # "skills_required": [skill.name for skill in event.skills]
    }), 200

@events_bp.route('/list', methods=['GET'])
def list_events():
    filters_dict = request.args.to_dict()

    events = query_handler(Events, filters_dict, date_column="date")

    if not events:
        return jsonify({"message": "No events found"}), 404
    
    return jsonify([{
        "event_id": event.event_id,
        "name": event.name,
        "description": event.description,
        "date": event.date.isoformat(),
        "address": event.address,
        "city": event.city,
        "state_id": event.state_id,
        "zipcode": event.zipcode,
        "urgency": event.urgency.name,
        # "skills_required": [skill.name for skill in event.skills]
    } for event in events]), 200

@events_bp.route('/create', methods=['POST'])
def create_event():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    try:
        new_event = Events(
            name=data['name'],
            description=data['description'],
            address=data.get('address'),
            city=data.get('city'),
            state_id=data['state_id'],
            zipcode=data.get('zipcode'),
            urgency=UrgencyEnum[data['urgency']],
            date=datetime.strptime(data['date'], '%Y-%m-%dT%H:%M:%S')
        )
        
        db.session.add(new_event)
        db.session.commit()

        socketio.emit(
            "event_assigned",
            {
                "event_id": new_event.event_id,
                "name": new_event.name,
                "description": new_event.description,
                "date": new_event.date.isoformat(),
                "address": new_event.address,
                "city": new_event.city,
                "state_id": new_event.state_id,
                "zipcode": new_event.zipcode,
                "urgency": new_event.urgency.name,
                "message": f"🆕 New event '{new_event.name}' has been created!"
            },
            broadcast=True
        )
        
        return jsonify({"message": "Event created successfully", "event_id": new_event.event_id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@events_bp.route('/<int:event_id>', methods=["DELETE"])
def delete_event(event_id):
    event = Events.query.get(event_id)
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({"message": "Event deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@events_bp.route('/<int:event_id>', methods=["PATCH"])
def update_event(event_id):
    data = request.get_json()
    event = Events.query.get_or_404(event_id)

    if not data:
        return jsonify({"error": "No update data provided"}), 400

    try:
        event.name = data.get("name", event.name)
        event.description = data.get("description", event.description)
        event.address = data.get("address", event.address)
        event.city = data.get("city", event.city)
        event.state_id = data.get("state_id", event.state_id)
        event.zipcode = data.get("zipcode", event.zipcode)
        event.urgency = UrgencyEnum[data.get("urgency", event.urgency.name)]
        event.date = datetime.strptime(data["date"], '%Y-%m-%dT%H:%M:%S') if "date" in data else event.date

        db.session.commit()

        socketio.emit(
            "event_update",
            {
                "event_id": event.event_id,
                "name": event.name,
                "description": event.description,
                "date": event.date.isoformat(),
                "address": event.address,
                "city": event.city,
                "state_id": event.state_id,
                "zipcode": event.zipcode,
                "urgency": event.urgency.name,
                "message": f"📅 Event '{event.name}' has been updated."
            },
            broadcast=True
        )

        return jsonify({"message": "Event updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500