package db.mysql;

import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.Connection;

public class MySQLTableCreation {
	// Run this as Java application to reset db schema.
	public static void main(String[] args) {
		try {
			// Step 1 Connect to MySQL.
			System.out.println("Connecting to " + MySQLDBUtil.URL);
			Class.forName("com.mysql.cj.jdbc.Driver").getConstructor().newInstance();
			Connection conn = DriverManager.getConnection(MySQLDBUtil.URL);
			
			if (conn == null) {
				return;
			}
			
			// Step 2 Drop tables in case they exist.
			Statement statement = conn.createStatement();
			String sql = "DROP TABLE IF EXISTS categories";
			statement.executeUpdate(sql);
			
			sql = "DROP TABLE IF EXISTS routes";
			statement.executeUpdate(sql);
			
			sql = "DROP TABLE IF EXISTS points";
			statement.executeUpdate(sql);
			
			sql = "DROP TABLE IF EXISTS users";
			statement.executeUpdate(sql);

			// Step 3 Create new tables
						sql = "CREATE TABLE points ("
								+ "point_id VARCHAR(255) NOT NULL,"
								+ "address VARCHAR(255),"
								+ "lat DECIMAL(9,6) NOT NULL,"
								+ "lon DECIMAL(9,6) NOT NULL,"								
								+ "visit_freq INT,"
								+ "PRIMARY KEY (point_id)"
								+ ")";
						statement.executeUpdate(sql);

						sql = "CREATE TABLE users ("
								+ "user_id VARCHAR(255) NOT NULL,"
								+ "password VARCHAR(255) NOT NULL,"
								+ "first_name VARCHAR(255),"
								+ "last_name VARCHAR(255),"
								+ "PRIMARY KEY (user_id)"
								+ ")";
						statement.executeUpdate(sql);

						sql = "CREATE TABLE categories ("
								+ "point_id VARCHAR(255) NOT NULL,"
								+ "category VARCHAR(255) NOT NULL,"
								+ "PRIMARY KEY (point_id, category),"
								+ "FOREIGN KEY (point_id) REFERENCES points(point_id)"
								+ ")";
						statement.executeUpdate(sql);

						sql = "CREATE TABLE routes ("
								+ "route_id VARCHAR(255) NOT NULL,"
								+ "user_id VARCHAR(255) NOT NULL,"
								+ "point_id VARCHAR(255) NOT NULL,"
								+ "point_order INT,"
								+ "last_update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
								+ "PRIMARY KEY (user_id, point_id, route_id),"
								+ "FOREIGN KEY (user_id) REFERENCES users(user_id),"
								+ "FOREIGN KEY (point_id) REFERENCES points(point_id)"
								+ ")";
						statement.executeUpdate(sql);

						// Step 4: insert fake user 1111/3229c1097c00d497a0fd282d586be050
						sql = "INSERT INTO users VALUES('1111', '3229c1097c00d497a0fd282d586be050', 'Joe', 'Tang')";
						statement.executeUpdate(sql);

			conn.close();
			System.out.println("Import is done successfully.");

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
