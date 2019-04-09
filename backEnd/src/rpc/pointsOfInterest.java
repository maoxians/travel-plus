package rpc;

import java.io.IOException;
import java.util.List;

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
import entity.Point;

/**
 * Servlet implementation class pointsOfInterest
 */
@WebServlet("/poiSearch")
public class pointsOfInterest extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public pointsOfInterest() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		HttpSession session = request.getSession(false);
		if(session == null){
			response.setStatus(403);
			return;
		}

		JSONObject input = RpcHelper.readJSONObject(request);
		DBConnection connection = DBConnectionFactory.getConnection();

		JSONArray array = new JSONArray();
		try {
			String numOfPoi = input.getString("poi_num");
			if (numOfPoi == null) {
				numOfPoi = "5";
			}
			List<Point> points = connection.searchPoI(Integer.parseInt(numOfPoi));
			if (points.size() > 0) {
				for(Point point : points){
					array.put(point.toJSONObject());
				}
				RpcHelper.writeJasonArray(response, array);
			} else {
				RpcHelper.writeJSONObject(response, new JSONObject().put("poi", "N/A"));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}finally{
			connection.close();
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
