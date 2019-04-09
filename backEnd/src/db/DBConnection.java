package db;

import java.util.List;
import java.util.Set;

//import org.json.JSONArray;
//import org.json.JSONException;
//import org.json.JSONObject;

import entity.Point;
import entity.Route;

/**
* void setRoute(String userId, String routeId) //insert a new route for user; or update an existing route
*  -- void setPoint(Point point) // save point to table point_of_interesting; or update (increase only) visit_freq for an existing route
* List<JSONObject> getRoutes(String userId) //get routes by user, return the most recent 5 routes, by last_update_time 
*  -- Set<JSONObject> getPoints (List<String> pointIds) // get points by pointId
* unsetRoutes(String userId, List<String> routeIds)  //remove a route; but won't change poi
* Set<String> getCategories(String pointId) //get category of a PoI
* List<JSONObject> searchPoI() // query PoI for top 10 most frequently visited points
* 
* String getFullname(String userId) 
* boolean registerUser(String userId, String password, String firstname, String lastname)
* public boolean verifyLogin(String userId, String password)
*/
public interface DBConnection {
	/**
	 * Close the connection.
	 */
	public void close();

	/**
	 * Insert a route for a user.
	 * 
	 * @param userId
	 * @param routeIds
	 */
	public boolean setRoute(Route route);

	/**
	 * Delete one route for a user.
	 * 
	 * @param userId
	 * @param routeId
	 */
	public void unsetRoute(String userId, String routeId);
	
	/**
	 * Delete several routes for a user.
	 * 
	 * @param userId
	 * @param routeIds
	 */
	public void unsetRoutes(String userId, List<String> routeIds);
	
	/**
	 * Delete all routes for a user.
	 * 
	 * @param userId
	 */
	public void unsetRoutes(String userId);

	/**
	 * Get the favorite item id for a user.
	 * 
	 * @param userId
	 * @return itemIds
	*/ 
	public Set<Route> getRoutes(String userId, String numOfRoute);
	

	/**
	 * Gets categories based on item id
	 * 
	 * @param itemId
	 * @return set of categories
	 */
	public Set<String> getCategories(String pointId);

	/**
	 * Search points of interest. the first 10 points with higher visiting frequency return. 
	 * 
	 * @param userId
	 * 
	 * @return list of points
	 */
	public List<Point> searchPoI(int numOfPoints);

	/**
	 * Save point into points_of_interest table.
	 * 
	 * @param point
	 */
	public void setPoint(Point point);
	
	/**
	 * Save points into points_of_interest table.
	 * 
	 * @param points
	 */
	public void setPoints(List<Point> points);

	/**
	 * Get the route ids for a user.
	 * 
	 * @param userId
	 * @return RouteIds
	 */
	public Set<String> getRouteIds(String userId, int numOfRoute);
	
	/**
	 * Get the point id for a route.
	 * 
	 * @param routeId
	 * @return pointIds
	 */
	public List<String> getPointIds(String routeId, String userId);

	/**
	 * Get point from points_of_interest table by pointIds.
	 * 
	 * @param point
	 */
	public List<Point> getRoutePoints (String routeId, String userId);
	
	/**
	 * Get full name of a user. (This is not needed for main course, just for demo
	 * and extension).
	 * 
	 * @param userId
	 * @return full name of the user
	 */
	public String getFullname(String userId);

	/**
	 * Return whether the credential is correct. (This is not needed for main
	 * course, just for demo and extension)
	 * 
	 * @param userIda
	 * @param password
	 * @return boolean
	 */
	public boolean verifyLogin(String userId, String password);
	
	/**
	 * Register one user
	 * 
	 * @param userId
	 * @param password
	 * @param firstname
	 * @param lastname
	 * @return boolean
	 */
	public boolean registerUser(String userId, String password, String firstname, String lastname);

}

