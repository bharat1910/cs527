package code;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map.Entry;

public class GenerateErrorCountClosureLinter {
	
	HashMap<String, Integer> errorCountMap;
	HashMap<String, String> errorDescriptionMap;
	private static String SOURCE = "error_files/closure_linter";
	private static String DESTINATION = "error_summary/closure_linter/";
	
	private void updateErrorCountMap(String str)
	{
		String errorCode = "";
		String errorDescription = "";
		str = str.split("E:")[1];
		
		boolean flag = false;
		for (int i=0; i<str.length(); i++) {
			
			if (str.charAt(i) == ':' && !flag) {
				flag = true;
				continue;
			}
			
			if (flag) {
				errorDescription += str.charAt(i);
			} else {
				errorCode += str.charAt(i);
			}
		}

		if (errorCountMap.containsKey(errorCode)) {
			errorCountMap.put(errorCode, errorCountMap.get(errorCode) + 1);
		} else {
			errorCountMap.put(errorCode, 1);
			errorDescriptionMap.put(errorCode, errorDescription);
		}
	}
	
	private void runForFile(String filePath, String fileName) throws IOException
	{
		BufferedReader br = new BufferedReader(new FileReader(filePath));
		BufferedWriter bw = new BufferedWriter(new FileWriter(DESTINATION + fileName));
		String str;
		
		while ((str = br.readLine()) != null) {
			try {
				if (str.contains("E:")) {
					updateErrorCountMap(str);
				}				
			} catch (Exception e) {
				continue;
			}
		}
		
		for (Entry<String, Integer> e : errorCountMap.entrySet()) {
			bw.write(e.getKey() + ": " + errorDescriptionMap.get(e.getKey()) + "         " + e.getValue() + "\n");
		}
		
		br.close();
		bw.close();
	}
	
	private void run() throws IOException
	{
		File root = new File(SOURCE);
		
		for (File f : root.listFiles()) {
			errorCountMap = new HashMap<>();
			errorDescriptionMap = new HashMap<>();
			runForFile(f.getAbsolutePath(), f.getName());
		}
	}
	
	public static void main(String[] args) throws IOException
	{
		GenerateErrorCountClosureLinter main = new GenerateErrorCountClosureLinter();
		main.run();
		System.exit(0);
	}
}