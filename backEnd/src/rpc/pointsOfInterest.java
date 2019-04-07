package rpc;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import db.DBConnection;
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

		DBConnection connection = DBConnectionFactory.getConnection();

		JSONArray array = new JSONArray();
		try {
			List<Point> points = connection.searchPoI(5);
			for(Point point : points){
				array.put(point.toJSONObject());
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
