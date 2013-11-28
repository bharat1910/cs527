package code;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


public class GenerateModifiedFileJsLInt {
	
	private static String SOURCE = "projects";
	private static String DESTINATION = "modified_projects/jslint";
	private static List<String> LINES_TO_ADD = new ArrayList<>();
	
	static {
	}
	
	private void writeModifiedFile(File f) throws IOException
	{
		String dest = f.getAbsolutePath().replace(SOURCE, DESTINATION);
		String str;
		
		BufferedReader br = new BufferedReader(new FileReader(f.getAbsolutePath()));
		BufferedWriter bw = new BufferedWriter(new FileWriter(dest));
		
		for (String s : LINES_TO_ADD) {
			bw.write(s + "\n");
		}
		
		while ((str = br.readLine()) != null) {
			bw.write(str + "\n");
		}
		
		br.close();
		bw.close();
	}
	
	private void createStructure(File f) throws IOException
	{
		if (f.isDirectory()) {
			
			File dir = new File(f.getPath().replace(SOURCE, DESTINATION));
			if (!dir.exists()) {
				dir.mkdir();
			}
			
			for (File ff : f.listFiles()) {
				createStructure(ff);
			}
		} else {
			writeModifiedFile(f);
		}
	}
	
	private void run() throws IOException
	{
		File root = new File("projects");
		createStructure(root);
	}
	
	public static void main(String[] args) throws IOException
	{
		GenerateModifiedFileJsLInt	main = new GenerateModifiedFileJsLInt();
		main.run();
		System.exit(0);
	}
}