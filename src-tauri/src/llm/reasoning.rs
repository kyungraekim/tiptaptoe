// Unified reasoning extraction helper for all LLMs
use regex::Regex;

pub fn extract_reasoning_and_output(text: &str) -> (Option<String>, String) {
    let re = Regex::new(r"(?s)<(?:think|thinking|reasoning)>(.*?)</(?:think|thinking|reasoning)>").unwrap();
    if let Some(caps) = re.captures(text) {
        let reasoning = caps.get(1).map(|m| m.as_str().trim().to_string());
        let output = re.replace_all(text, "").to_string();
        (reasoning, output.trim().to_string())
    } else {
        (None, text.trim().to_string())
    }
}
