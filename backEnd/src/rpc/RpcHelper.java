package rpc;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

public class RpcHelper {
	
public static void writeJasonArray(HttpServletResponse response, JSONArray arr) throws IOException {
	if (arr.length() >= 1) {
		response.setContentType("application/json");
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		PrintWriter out = response.getWriter();
		
		out.print(arr);
		out.close();
	}
}

public static void writeJSONObject(HttpServletResponse response, JSONObject obj) throws IOException {
	response.setContentType("application/json");
	response.setHeader("Access-Control-Allow-Origin", "*");
	PrintWriter out = response.getWriter();
	
	out.print(obj);
	out.close();	
}

//Parses a JSONObject from http request.
	public static JSONObject readJSONObject(HttpServletRequest request) {
	   StringBuilder sBuilder = new StringBuilder();
	   try (BufferedReader reader = request.getReader()) {
		 String line = null;
		 while((line = reader.readLine()) != null) {
			 sBuilder.append(line);
		 }
		 return new JSONObject(sBuilder.toString());
		
	   } catch (Exception e) {
		 e.printStackTrace();
	   }
	
	  return new JSONObject();
         }

}
