package rpc;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
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
		
		JSONObject input = RpcHelper.readJSONObject(request);
		
		DBConnection conn = DBConnectionFactory.getConnection();
		try {
			String numOfRoutes = input.getString("route_num");
			if (numOfRoutes == null) {
				numOfRoutes = "5";
			}
			Set<Route> routes = conn.getRoutes(userId, numOfRoutes);
			if (routes.size() > 0) {
				for (Route route : routes) {
					JSONObject obj = route.toJSONObject();
					array.put(obj);
				}
				RpcHelper.writeJasonArray(response, array);
			} else {
				RpcHelper.writeJSONObject(response, new JSONObject().put("history_plan", "N/A"));
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			conn.close();
		}	
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	/*
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
	}*/

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
			RpcHelper.writeJSONObject(response, new JSONObject().put("result", "SUCCESS"));

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			connection.close();
		}
	}
}
