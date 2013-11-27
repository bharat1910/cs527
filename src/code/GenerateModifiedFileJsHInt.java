package code;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;


public class GenerateModifiedFileJsHInt {
	
	private void run() throws IOException
	{
		File root = new File("src");
		BufferedReader br;
		
		for (File f : root.listFiles()) {
			
			for (File ff : f.listFiles()) {
				br = new BufferedReader(new FileReader(ff.getAbsolutePath()));
				
				br.close();
			}
		}
	}
	
	public static void main(String[] args) throws IOException
	{
		GenerateModifiedFileJsHInt	main = new GenerateModifiedFileJsHInt();
		main.run();
		System.exit(0);
	}
}
