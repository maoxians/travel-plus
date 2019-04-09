package rpc;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import db.DBConnection;
import db.DBConnectionFactory;
import entity.Point;
import entity.Point.PointBuilder;
//import entity.Route;
import entity.Route.RouteBuilder;

/**
 * Servlet implementation class Routing
 */
@WebServlet("/route")
public class Routing extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Routing() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}
	*/

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		/*// allow access only if session exists
		HttpSession session = request.getSession(false);
		if (session == null) {
			response.setStatus(403);
			return;
		}*/
		
		DBConnection connection = DBConnectionFactory.getConnection();
		try {
			JSONObject input = RpcHelper.readJSONObject(request);
			JSONArray points = input.getJSONArray("points");
			
			RouteBuilder builder = new RouteBuilder();
			
			builder.setUserId(input.getString("user_id"));
			builder.setRouteId(input.getString("route_id"));
			builder.setRoutePoints(getPointList(points));
		    
		    JSONObject obj = new JSONObject();
			if (connection.setRoute(builder.build())) {
				obj.put("status", "OK");
			} else {
				obj.put("status", "Failed to save route. ");
			}
			RpcHelper.writeJSONObject(response, obj);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			connection.close();
		}
}

// Convert JSONArray to a list of item objects.
private List<Point> getPointList(JSONArray points) throws JSONException {
	List<Point> pointList = new ArrayList<>();
	for (int i = 0; i < points.length(); ++i) {
		JSONObject point = points.getJSONObject(i);
		
		PointBuilder builder = new PointBuilder();
		if (!point.isNull("id")) {
			builder.setPointId(point.getString("id"));
		}
		if (!point.isNull("lat")) {
			builder.setLat(point.getDouble("lat"));
		}
		if (!point.isNull("lng")) {
			builder.setLon(point.getDouble("lng"));
		}
		if (!point.isNull("step")) {
			builder.setOrderInRoute(point.getInt("step"));
		}
		if (!point.isNull("name")) {
			builder.setAddress(point.getString("name"));
		}
		
		builder.setCategories(getCategories(point));
		builder.setVisitFreq(1);
		
		pointList.add(builder.build());
	}
	return pointList;
}

private Set<String> getCategories(JSONObject point) throws JSONException {
	
	Set<String> categories = new HashSet<>();
	if (!point.isNull("classifications")) {
		JSONArray classifications = point.getJSONArray("classifications");
		for (int i = 0; i < classifications.length(); ++i) {
			JSONObject classification = classifications.getJSONObject(i);
			if (!classification.isNull("segment")) {
				JSONObject segment = classification.getJSONObject("segment");
				if (!segment.isNull("name")) {
					categories.add(segment.getString("name"));
				}
			}
		}
	}
	return categories;
}
}

