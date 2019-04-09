package entity;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Point {
	private String pointId;
	private double lat;
	private double lon;
	private String address;
	private Set<String> categories;
	private int visitFreq;
	private int orderInRoute; //not in table field, only for JSON obj in a route
	/**
	 * This is a builder pattern in Java.
	 */
	private Point(PointBuilder builder) {
		this.pointId = builder.pointId;
		this.lat = builder.lat;
		this.lon = builder.lon;
		this.address = builder.address;
		this.categories = builder.categories;
		this.visitFreq = builder.visitFreq;
		this.orderInRoute = builder.orderInRoute;
		
	}	

	public String getPointId() {
		return pointId;
	}
	public double getLat() {
		return lat;
	}
	public double getLon() {
		return lon;
	}
	public String getAddress() {
		return address;
	}
	public Set<String> getCategories() {
		return categories;
	}	
	public double getVisitFreq() {
		return visitFreq;
	}
	public int getOrderInRoute() {
		return orderInRoute;
	}

	public JSONObject toJSONObject() {
		JSONObject obj = new JSONObject();
		try {
			obj.put("id", pointId);
			obj.put("lat", lat);
			obj.put("lng", lon);
			obj.put("name", address);
			obj.put("classifications", new JSONArray(categories));
			obj.put("freq", visitFreq);
			obj.put("step", orderInRoute);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return obj;
	}	

public static class PointBuilder{
	private String pointId;
	private double lat;
	private double lon;
	private String address;
	private Set<String> categories;
	private int visitFreq;
	private int orderInRoute;
	
	public void setPointId(String pointId) {
		this.pointId = pointId;
	}
	public void setLat(double lat) {
		this.lat = lat;
	}
	public void setLon(double lon) {
		this.lon = lon;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public void setCategories(Set<String> categories) {
		this.categories = categories;
	}
	public void setVisitFreq(int visitFreq) {
		this.visitFreq = visitFreq;
	}
	public void setOrderInRoute(int orderInRoute) {
		this.orderInRoute = orderInRoute;
	}
		
	public Point build() {
		return new Point(this);	
	}	
	
}
}
