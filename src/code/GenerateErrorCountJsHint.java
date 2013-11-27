package code;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map.Entry;

public class GenerateErrorCountJsHint {
	
	HashMap<String, Integer> errorCount = new HashMap<>();
	private double THRESHOLD = 0.7;
	private static String SOURCE = "error_files";
	private static String DESTINATION = "error_summary/jshint/";
	
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
			try {
				if (!str.equals("")) {
					updateErrorCountMap(str.split(",")[2]);
				}				
			} catch (Exception e) {
				continue;
			}
		}
		
		for (Entry<String, Integer> e : errorCount.entrySet()) {
			bw.write(e.getKey() + "     " + e.getValue() + "\n");
		}
		
		br.close();
		bw.close();
	}
	
	private void run() throws IOException
	{
		File root = new File(SOURCE);
		
		for (File f : root.listFiles()) {
			for (File ff : f.listFiles()) {
				runForFile(ff.getAbsolutePath(), ff.getName());
			}
			
		}
	}
	
	public static void main(String[] args) throws IOException
	{
		GenerateErrorCountJsHint main = new GenerateErrorCountJsHint();
		main.run();
		System.exit(0);
	}
}