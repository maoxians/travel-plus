package db.mysql;

import java.util.List;
import java.util.Set;

import org.json.JSONObject;

import db.DBConnection;
import entity.Point;

public class MySQLConnection implements DBConnection {

	@Override
	public void close() {
		// TODO Auto-generated method stub

	}

	@Override
	public void setRoute(String userId, String RouteId) {
		// TODO Auto-generated method stub

	}

	@Override
	public void unsetRoutes(String userId, List<String> routeIds) {
		// TODO Auto-generated method stub

	}

	@Override
	public Set<JSONObject> getRoutes(String userId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Set<String> getCategories(String pointId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<JSONObject> searchPoI(String userId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void savePoint(Point point) {
		// TODO Auto-generated method stub

	}

	@Override
	public String getFullname(String userId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean verifyLogin(String userId, String password) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean registerUser(String userId, String password, String firstname, String lastname) {
		// TODO Auto-generated method stub
		return false;
	}

}
