package code;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map.Entry;

public class GenerateErrorCountJsLint {
	
	HashMap<String, Integer> errorCount = new HashMap<>();
	private double THRESHOLD = 0.5;
	
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
	
	private void run() throws IOException
	{
		BufferedReader br = new BufferedReader(new FileReader("src/SampleErrorJsLint.txt"));
		String str;
		
		while ((str = br.readLine()) != null) {
			if (!str.equals("") && str.charAt(0) == '#') {
				updateErrorCountMap(str);
			}
		}
		
		for (Entry<String, Integer> e : errorCount.entrySet()) {
			System.out.println(e.getKey() + "     " + e.getValue());
		}
	}
	
	public static void main(String[] args) throws IOException
	{
		GenerateErrorCountJsLint main = new GenerateErrorCountJsLint();
		main.run();
		System.exit(0);
	}
}