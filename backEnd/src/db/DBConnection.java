package db;

import java.util.List;
import java.util.Set;

//import org.json.JSONArray;
//import org.json.JSONException;
import org.json.JSONObject;

import entity.Point;
//import entity.Route;

/**
* setRoute(String userId, String routeId) //insert a new route for user; or update a existing route
*  -- savePoint(Point point) // save point to table point_of_interesting
* getRoutes(String userId) //get routes by user
* unsetRoutes(String userId, List<String> routeIds)  //remove a route
* getRoutePoints(String userId, String routeId) //get PoI of a route
* Set<String> getCategories(String pointId) //get category of a PoI
* List<JSONObject> searchPoI(String userId) // search PoI
* String getFullname(String userId) 
* boolean registerUser(String userId, String password, String firstname, String lastname)
* 
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
	public void setRoute(String userId, String RouteId);

	/**
	 * Delete the route for a user.
	 * 
	 * @param userId
	 * @param routeId
	 */
	public void unsetRoutes(String userId, List<String> routeIds);

	/**
	 * Get the favorite item id for a user.
	 * 
	 * @param userId
	 * @return itemIds
	 
	public Set<String> getFavoriteItemIds(String userId);
	*/

	/**
	 * Gets routes based on user id
	 * 
	 * @param userId
	 * @return set of routes JSONObject
	 */
	public Set<JSONObject> getRoutes(String userId);
	
	/**
	 * Gets categories based on item id
	 * 
	 * @param itemId
	 * @return set of categories
	 */
	public Set<String> getCategories(String pointId);

	/**
	 * Search points of interest for a user (optional). If user is null, 
	 * the first 10 points with higher visiting frequency return. 
	 * 
	 * @param userId
	 * 
	 * @return list of points
	 */
	public List<JSONObject> searchPoI(String userId);

	/**
	 * Save point into db poi table.
	 * 
	 * @param point
	 */
	public void savePoint(Point point);

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

