from google.genai import types
from app.core.config import client, MODEL_NAME
import json

def run_agent_with_tools(system_instruction: str, message: str, tools: list, tool_map: dict) -> str:
    """Helper to run a Gemini agent with function calling (tools)."""
    if not client:
        return f"[Mock Agent Response] Would have called tools: {[t.__name__ for t in tool_map.values() if hasattr(t, '__name__')]}"

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.4,
        tools=tools
    )
    
    # Initialize the chat session
    chat = client.chats.create(model=MODEL_NAME, config=config)
    response = chat.send_message(message)
    
    # Simple loop to handle tool calls
    MAX_TURNS = 5
    for _ in range(MAX_TURNS):
        if not response.function_calls:
            break
            
        # Execute all requested functions
        parts = []
        for fc in response.function_calls:
            func_name = fc.name
            args = fc.args
            if func_name in tool_map:
                try:
                    # Pass the arguments dynamically
                    result = tool_map[func_name](**args)
                    parts.append(types.Part.from_function_response(
                        name=func_name,
                        response={"result": result}
                    ))
                except Exception as e:
                    parts.append(types.Part.from_function_response(
                        name=func_name,
                        response={"error": str(e)}
                    ))
            else:
                parts.append(types.Part.from_function_response(
                    name=func_name,
                    response={"error": f"Unknown function {func_name}"}
                ))
        
        # Send the function responses back to the model
        response = chat.send_message(parts)
        
    return response.text
