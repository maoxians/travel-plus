package db.mysql;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import db.DBConnection;
import entity.Point;
import entity.Point.PointBuilder;
import entity.Route;
import entity.Route.RouteBuilder;


public class MySQLConnection implements DBConnection {

	private Connection conn;
	
	@Override
	public void close() {
		if (conn != null) {
	  		 try {
	  			 conn.close();
	  		 } catch (Exception e) {
	  			 e.printStackTrace();
	  		 }
	  	 }
	}

	@Override
	public boolean setRoute(Route route) {
        if (conn == null) {
			System.err.println("DB connection failed");
			return false;
		 }
        
		// if the routeId exists, which means update the route; we delete the old first, then add.
        if (routeExist(route.getUserId(), route.getRouteId())) {
        	unsetRoute(route.getUserId(), route.getRouteId());
        }
                
		try {
			String sql = "INSERT IGNORE INTO routes(last_update_time, user_id, point_id, point_order) "
					+ "VALUES (CURRENT_TIMESTAMP(), ?, ?, ?)";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, route.getUserId());
			//ps.setTimestamp(4, NOW());
			for (Point point : route.getPoints()) {
				 ps.setString(2, point.getPointId());
				 ps.setInt(3, point.getOrderInRoute());
				 ps.execute();
			}
			
			setPoints(route.getPoints());
			
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}

	private boolean routeExist(String userId, String routeId) {
		if (conn == null) {
			System.err.println("DB connection failed");
			return false;
		}
		
		String sql  = "SELECT COUNT(*) FROM routes "
				+ "WHERE route_id = ? AND user_id = ? ";
		PreparedStatement ps;
		ResultSet rs;
		int count = 0; 
		try {
			ps = conn.prepareStatement(sql);
			ps.setString(1, routeId);
			ps.setString(2, userId);
			rs = ps.executeQuery();
			count = rs.getInt(1);			
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return count == 1 ? true : false;	
	}

	@Override
	public void unsetRoute(String userId, String routeId) {
        if (conn == null) {
			System.err.println("DB connection failed");
			return;
		 }
		
		try {
			String sql = "DELETE FROM routes WHERE user_id = ? AND route_id = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, userId);
			ps.setString(2, routeId);
			ps.execute();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void unsetRoutes(String userId) {
        if (conn == null) {
		System.err.println("DB connection failed");
		return;
		 }
		
		try {
			String sql = "DELETE FROM routes WHERE user_id = ? ";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, userId);
			ps.execute();
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public void unsetRoutes(String userId, List<String> routeIds) {
        if (conn == null) {
		System.err.println("DB connection failed");
		return;
		 }
		
		try {
			String sql = "DELETE FROM routes WHERE user_id = ? AND route_id = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, userId);
			for (String routeId : routeIds) {
				 ps.setString(2, routeId);
				 ps.execute();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public Set<String> getRouteIds(String userId) {
		if (conn == null) {
			return null;
		}
		Set<String> routeIds = new HashSet<>();
		try {
			String sql = "SELECT route_id FROM routes WHERE user_id = ? ";
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(1, userId);
			ResultSet rs = statement.executeQuery();
			while (rs.next()) {
				String routeId = rs.getString("route_id");
				routeIds.add(routeId);
			}
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return routeIds;
	}
		
	@Override
	public List<String> getPointIds(String routeId, String userId) {
		if (conn == null) {
			return null;
		}
		List<String> pointIds = new ArrayList<>();
		try {
			String sql = "SELECT point_id FROM routes "
					+ "WHERE user_id = ? AND route_id = ? "
					+ "GROUP BY point_order ";
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(1, userId);
			statement.setString(2, routeId);
			ResultSet rs = statement.executeQuery();
			while (rs.next()) {
				String pointId = rs.getString("point_id");
				pointIds.add(pointId);
			}
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return pointIds;
	}
	
	@Override
	public Set<Route> getRoutes(String userId) {
		if (conn == null) {
			return new HashSet<>();
		}
		
		Set<Route> routes = new HashSet<>();
		Set<String> routeIds = getRouteIds(userId);
		
		try {
			String sql = "SELECT * FROM routes WHERE route_id = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			for (String routeId : routeIds) {
				ps.setString(1, routeId);			
				ResultSet rs = ps.executeQuery();
				
				RouteBuilder builder = new RouteBuilder();
				
				while (rs.next()) {
					builder.setRouteId(rs.getString(routeId));
					builder.setUserId(userId);
					builder.setRoutePoints(getRoutePoints(routeId, userId));
								
					routes.add(builder.build());
				}
			}	
			} catch (SQLException e) {
				e.printStackTrace();
			}

		return routes;
	}
	
	@Override
	public List<Point> getRoutePoints(String routeId, String userId) {
		if (conn == null) {
			return new ArrayList<>();
		}
		
		List<Point> pointsInRoute = new ArrayList<>();
		List<String> pointIds = getPointIds(routeId, userId);
		
		try {
			String sql = "SELECT * FROM points WHERE point_id = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			for (String pointId : pointIds) {
				ps.setString(1, pointId);			
				ResultSet rs = ps.executeQuery();
				int pointOrder = 0;
				PointBuilder builder = new PointBuilder();
				
				while (rs.next()) {
					builder.setAddress(rs.getString("address"));
					builder.setCategories(getCategories(pointId));
					builder.setLat(rs.getDouble("lat"));
					builder.setLon(rs.getDouble("lon"));
					builder.setOrderInRoute(pointOrder ++);
					builder.setPointId(pointId);
					builder.setVisitFreq(rs.getInt("visit_freq"));
					
					pointsInRoute.add(builder.build());
				}
			}				
		} catch (SQLException e) {
			e.printStackTrace();
		}
		
		return pointsInRoute;
	}


	@Override
	public Set<String> getCategories(String pointId) {
		if (conn == null) {
			return null;
		}
		Set<String> categories = new HashSet<>();
		try {
			String sql = "SELECT category from categories WHERE point_id = ? ";
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(1, pointId);
			ResultSet rs = statement.executeQuery();
			while (rs.next()) {
				String category = rs.getString("category");
				categories.add(category);
			}
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return categories;
	}

	@Override
	public List<Point> searchPoI(int numOfPoints) {
		if (conn == null) {
			return null;
		}
		List<Point> points = new ArrayList<>();
		try {
			String sql = "SELECT * from points ORDER BY visit_freq DESC LIMIT ? ";
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setInt(1, numOfPoints);
			
			ResultSet rs = statement.executeQuery();
			
			PointBuilder builder = new PointBuilder();
		
			while (rs.next()) {
				builder.setPointId(rs.getString("point_id"));
				builder.setAddress(rs.getString("address"));
				builder.setCategories(getCategories(rs.getString("point_id")));
				builder.setLat(rs.getDouble("lat"));
				builder.setLon(rs.getDouble("lon"));
				builder.setOrderInRoute(0);				
				builder.setVisitFreq(rs.getInt("visit_freq"));
				
				points.add(builder.build());
			}
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
		return points;
	}
	
	@Override
	public void setPoint(Point point) {
		if (conn == null) {
			System.err.println("DB connection failed");
			return;
		}		
		if (pointExist(point)) {			
			updateVisitFreq(point);			
		} else {
			addPoint(point);
		}
				
	}
	
	private boolean pointExist(Point point) {
		if (conn == null) {
			System.err.println("DB connection failed");
			return false;
		}
		 		
		String sql  = "SELECT COUNT(*) FROM points WHERE point_id = ? ";
		PreparedStatement ps;
		ResultSet rs;
		int count = 0; 
		try {
			ps = conn.prepareStatement(sql);
			ps.setString(1, point.getPointId());
			rs = ps.executeQuery();
			count = rs.getInt(1);			
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return count == 1 ? true : false;		 
	}

	private void updateVisitFreq(Point point) {
		if (conn == null) {
			System.err.println("DB connection failed");
			return;
		}
		
		String sql = "UPDATE points "
					+ "SET visit_freq = visit_freq + 1 "
					+ "WHERE point_id = ? ";
		
		PreparedStatement ps;
		try {
			ps = conn.prepareStatement(sql);
			ps.setString(1, point.getPointId());			
			ps.execute();				
		} catch (SQLException e) {
			
			e.printStackTrace();
		}		
	}

	private void addPoint(Point point) {
		if (conn == null) {
			System.err.println("DB connection failed");
			return;
		}
				
		String sql  = "INSERT IGNORE INTO points VALUES(?, ?, ?, ?, ?)";
		PreparedStatement ps;
		try {
			ps = conn.prepareStatement(sql);
			ps.setString(1, point.getPointId());
			ps.setString(2, point.getAddress());
			ps.setDouble(3, point.getLat());
			ps.setDouble(4, point.getLon());
			ps.setDouble(5, point.getVisitFreq());
			ps.execute();
			
			sql = "INSERT IGNORE INTO categories VALUES(?, ?)";
			ps = conn.prepareStatement(sql);
			ps.setString(1,  point.getPointId());
			for (String category : point.getCategories()) {
				ps.setString(2,  category);
				ps.execute();				
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}		
	}

	@Override
	public void setPoints(List<Point> points) {
		if (conn == null) {
			System.err.println("DB connection failed");
			return;
		}
		
		try {
			for (Point poi : points) {
				setPoint(poi);
			}			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public String getFullname(String userId) {
		if (conn == null) {
			return "";
		}
		
		String name = "";
		try {
			String sql = "SELECT first_name, last_name FROM users WHERE user_id = ? ";
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(1, userId);
			ResultSet rs = statement.executeQuery();
			
			while (rs.next()) {
				name = rs.getString("first_name") + " " + rs.getString("last_name");
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}

		return name;
	}

	@Override
	public boolean verifyLogin(String userId, String password) {
		if (conn == null) {
			return false;
		}
	
		try {
			String sql="SELECT * FROM users WHERE user_id = ? AND password = ? ";
			PreparedStatement statement=conn.prepareStatement(sql);
			statement.setString(1, userId);
			statement.setString(2, password);
			ResultSet rs=statement.executeQuery();
			while (rs.next()) {
				return true;
			}
		} catch (SQLException e){
			e.printStackTrace();
		}

	
		return false;
	}

	@Override
	public boolean registerUser(String userId, String password, String firstname, String lastname) {
		if (conn == null) {
	  		 System.err.println("DB connection failed");
	  		 return false;
	  	       }
	  	
	  	try {
	  		 String sql = "INSERT IGNORE INTO users VALUES (?, ?, ?, ?)";
	  		 PreparedStatement ps = conn.prepareStatement(sql);
	  		 ps.setString(1, userId);
	  		 ps.setString(2, password);
	  		 ps.setString(3, firstname);
	  		 ps.setString(4, lastname);
	  		 
	  		 return ps.executeUpdate() == 1;
	  		 
	    } catch (Exception e) {
	  		 e.printStackTrace();
	    }
		return false;
	}

}
