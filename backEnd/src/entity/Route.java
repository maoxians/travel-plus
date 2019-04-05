package entity;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Route {
	private String routeId; //id of a route
	private String userId;
	private List<Point> routePoints;
	
	/**
	 * This is a builder pattern in Java.
	 */
	private Route(RouteBuilder builder) {
		this.routeId = builder.routeId;
		this.userId = builder.userId;
		this.routePoints = builder.routePoints;
	}	

	public String getRouteId() {
		return routeId;
	}
	public String getUserId() {
		return userId;
	}
	public List<Point> getPoints() {
		return routePoints;
	}

	public JSONObject toJSONObject() {
		JSONObject obj = new JSONObject();
		try {
			obj.put("route_id", routeId);
			obj.put("user_id", userId);
			obj.put("route_points", new JSONArray(routePoints));
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return obj;
	}	

public static class RouteBuilder{
	private String routeId;
	private String userId;
	private List<Point> routePoints;
	
	public void setRouteId(String routeId) {
		this.routeId = routeId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public void setRoutePoints(List<Point> routePoints) {
		this.routePoints = routePoints;
	}
	
	public Route build() {
		return new Route(this);	
	}
	
}
}
