package code;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

public class GenerateFaultSummaryByTool {
	
	private static String SOURCE = "error_summary/";
	private static List<String> tools = new ArrayList<String>();
	private double THRESHOLD = 0.7;
	private Map<String, Integer> errorCountMap;
	private Map<String, String> errorDescriptionMap = new HashMap<>();
	
	static {
		tools.add("jshint");
		tools.add("jslint");
		tools.add("closure_linter");
	}
	
	private boolean isMatch(String a, String b)
	{
		String[] aList = a.split(" ");
		int match = 0;
		int total = 0;
		
		for (String s : aList) {
			total++;
			if (b.contains(s.trim())) {
				match++;
			}
		}
		
		return match/(double) total > THRESHOLD;
	}
	
	private void updateErrorCountMap(File f, String tool) throws IOException
	{
		BufferedReader br = new BufferedReader(new FileReader(f.getAbsoluteFile()));
		String str, errorCode;
		String[] strList;
		boolean flag;
		
		while ((str = br.readLine()) != null) {
			strList = str.split(" ", 2);
			flag = true;
			
			if (tool.equals("closure_linter")) {
				errorCode = strList[1].split(":")[0].trim();
				if (errorCountMap.containsKey(errorCode)) {
					errorCountMap.put(errorCode, errorCountMap.get(errorCode) + Integer.parseInt(strList[0]));
					flag = false;
				}
			} else {
				for (Entry<String, Integer> e : errorCountMap.entrySet()) {
					if(isMatch(strList[1], e.getKey())) {
						errorCountMap.put(e.getKey(), e.getValue() + Integer.parseInt(strList[0]));
						flag = false;
						break;
					}					
				}
			}
			
			if (flag) {
				if (tool.equals("closure_linter")) {
					errorCountMap.put(strList[1].split(":")[0].trim(), Integer.parseInt(strList[0]));
					errorDescriptionMap.put(strList[1].split(":")[0].trim(), strList[1]);
				} else {
					errorCountMap.put(strList[1], Integer.parseInt(strList[0]));
				}
			}
		}
		
		br.close();
	}
	
	private void generateSummaryForTool(String tool) throws IOException
	{
		File dir = new File(SOURCE + tool);
		for (File f : dir.listFiles()) {
			if (f.isDirectory()) {
				continue;
			}
			
			updateErrorCountMap(f, tool);
		}
		
		BufferedWriter bw = new BufferedWriter(new FileWriter(SOURCE + tool + "/summary/" + "summary.txt"));
		
		for (Entry<String, Integer> e : errorCountMap.entrySet()) {
			if (tool.equals("closure_linter")) {
				bw.write(e.getValue() + "        " + errorDescriptionMap.get(e.getKey()) + "\n");
			} else {
				bw.write(e.getValue() + "        " + e.getKey() + "\n");
			}
		}
		
		bw.close();
	}
	
	private void run() throws IOException
	{
		for (String s : tools) {
			errorCountMap = new HashMap<>();
			generateSummaryForTool(s);
		}
	}
	
	public static void main(String[] args) throws IOException
	{
		GenerateFaultSummaryByTool main = new GenerateFaultSummaryByTool();
		main.run();
		System.exit(0);
	}
}