package rpc;

import java.io.IOException;
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
import entity.Route;
import rpc.RpcHelper;

/**
 * Servlet implementation class historyRoutes
 */
@WebServlet("/history")
public class historyRoutes extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
	public historyRoutes() {
		super();
        // TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// allow access only if session exists
		HttpSession session = request.getSession(false);
		if (session == null) {
			response.setStatus(403);
			return;
		}
		// optional
		String userId = session.getAttribute("user_id").toString();
		JSONArray array = new JSONArray();

		DBConnection conn = DBConnectionFactory.getConnection();
		try {
			Set<JSONObject> routes = conn.getRoutes(userId);
			for (JSONObject route : routes) {
				JSONObject obj = route;
				obj.append("favorite", true);
				array.put(obj);
			}

			RpcHelper.writeJsonArray(response, array);
		} catch (JSONException e) {
			e.printStackTrace();
		} finally {
			conn.close();
		}	
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// allow access only if session exists
		HttpSession session = request.getSession(false);
		if (session == null) {
			response.setStatus(403);
			return;
		}
		// optional
		String userId = session.getAttribute("user_id").toString();

		DBConnection connection = DBConnectionFactory.getConnection();
		try {
			JSONObject input = RpcHelper.readJSONObject(request);
			JSONArray array = input.getJSONArray("favorite");
			List<String> routeIds = new ArrayList<>();
			for (int i = 0; i < array.length(); ++i) {
				routeIds.add(array.getString(i));
			}
			connection.setRoute(userId, routeIds);
			RpcHelper.writeJsonObject(response, new JSONObject().put("result", "SUCCESS"));

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			connection.close();
		}
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */
	protected void doDelete(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// allow access only if session exists
		HttpSession session = request.getSession(false);
		if (session == null) {
			response.setStatus(403);
			return;
		}
		// optional
		String userId = session.getAttribute("user_id").toString();

		DBConnection connection = DBConnectionFactory.getConnection();
		try {
			JSONObject input = RpcHelper.readJSONObject(request);
			JSONArray array = input.getJSONArray("favorite");
			List<String> routeIds = new ArrayList<>();
			for (int i = 0; i < array.length(); ++i) {
				routeIds.add(array.getString(i));
			}
			connection.unsetRoutes(userId, routeIds);
			RpcHelper.writeJsonObject(response, new JSONObject().put("result", "SUCCESS"));

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			connection.close();
		}
	}
}
