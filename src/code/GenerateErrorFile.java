package code;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

public class GenerateErrorFile
{
	private static Map<String, String> commandForTool = new HashMap<>();
	private static List<String> projects = new ArrayList<>(); 
	private static String SOURCE = "modified_projects/";
	private static String DEST = "error_files/";
	
	static {
		//commandForTool.put("jshint", "jshint ");
		commandForTool.put("jslint", "jslint -maxerr 1000 ");
		//commandForTool.put("closure_linter", "gjslint ");
		
		projects.add("highcharts");
		projects.add("angularjs");
		projects.add("kuda");
		projects.add("slickgrid");
		projects.add("mywebsql");
	}
	
	private void runRecursivelyOnFiles(File f, BufferedWriter bw, String command) throws IOException
	{
		String str;
		
		if (f.isDirectory()) {
			for (File ff : f.listFiles()) {
				runRecursivelyOnFiles(ff, bw, command);
			}
		} else {
			Process p = Runtime.getRuntime().exec(command + f.getAbsolutePath());
			BufferedReader br = new BufferedReader(new InputStreamReader(
					p.getInputStream()));

			while ((str = br.readLine()) != null) {
				bw.append(str + "\n");
				//System.out.println(str);
			}
		}
	}
	
	private void runCommandOnProjects(String tool, String command) throws IOException
	{
		for (String s : projects) {
			BufferedWriter bw = new BufferedWriter(new FileWriter(DEST + tool + "/" + s + ".txt"));
			
			runRecursivelyOnFiles(new File(SOURCE + tool + "/" + s), bw, command);
			
			bw.close();
		}
	}
	
	private void run() throws IOException
	{
		for (Entry<String, String> e : commandForTool.entrySet()) {
			runCommandOnProjects(e.getKey(), e.getValue());
		}
	}

	public static void main(String[] args) throws IOException
	{
		GenerateErrorFile main = new GenerateErrorFile();
		main.run();
		System.exit(0);
	}
}
