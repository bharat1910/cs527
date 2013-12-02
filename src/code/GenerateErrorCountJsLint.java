package code;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map.Entry;

public class GenerateErrorCountJsLint {
	
	HashMap<String, Integer> errorCount;
	private double THRESHOLD = 0.5;
	private static String SOURCE = "error_files/jslint/";
	private static String DESTINATION = "error_summary/jslint/";
	
	private boolean isMatch(String a, String b)
	{
		String[] aList = a.split(" ");
		String[] bList = b.split(" ");
		int matchA = 0;
		int totalA = 0;
		int matchB = 0;
		int totalB = 0;
		
		for (String s : aList) {
			totalA++;
			if (b.contains(s.trim())) {
				matchA++;
			}
		}
				
		for (String s : bList) {
			totalB++;
			if (a.contains(s.trim())) {
				matchB++;
			}
		}
		
		return (matchA / (double) totalA > THRESHOLD) &&
				(matchB / (double) totalB > THRESHOLD);
	}
	
	private void updateErrorCountMap(String str)
	{
		for (Entry<String, Integer> e : errorCount.entrySet()) {
			if(isMatch(str, e.getKey())) {
				errorCount.put(e.getKey(), e.getValue() + 1);
				return;
			}
		}
		
		errorCount.put(str, 1);
	}
	
	private void runForFile(String filePath, String fileName) throws IOException
	{
		BufferedReader br = new BufferedReader(new FileReader(filePath));
		BufferedWriter bw = new BufferedWriter(new FileWriter(DESTINATION + fileName));
		
		String str;
		while ((str = br.readLine()) != null) {
			if (!str.equals("") && str.trim().charAt(0) == '#') {
				updateErrorCountMap(str);
			}
		}
		
		for (Entry<String, Integer> e : errorCount.entrySet()) {
			bw.write(e.getValue() + "     " + e.getKey() + "\n");
		}
		
		br.close();
		bw.close();
	}
	
	private void run() throws IOException
	{
		File root = new File(SOURCE);
		
		for (File f : root.listFiles()) {
			errorCount = new HashMap<>();
			runForFile(f.getPath(), f.getName());
		}
	}
	
	public static void main(String[] args) throws IOException
	{
		GenerateErrorCountJsLint main = new GenerateErrorCountJsLint();
		main.run();
		System.exit(0);
	}
}