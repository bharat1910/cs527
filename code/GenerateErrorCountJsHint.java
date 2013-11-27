import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map.Entry;

public class GenerateErrorCountJsHint {
	
	HashMap<String, Integer> errorCount = new HashMap<>();
	private double THRESHOLD = 0.7;
	
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
		BufferedReader br = new BufferedReader(new FileReader("src/SampleError.txt"));
		String str;
		
		while ((str = br.readLine()) != null) {
			if (!str.equals("")) {
				updateErrorCountMap(str.split(",")[2]);
			}
		}
		
		for (Entry<String, Integer> e : errorCount.entrySet()) {
			System.out.println(e.getKey() + "     " + e.getValue());
		}
	}
	
	public static void main(String[] args) throws IOException
	{
		GenerateErrorCountJsHint main = new GenerateErrorCountJsHint();
		main.run();
		System.exit(0);
	}
}