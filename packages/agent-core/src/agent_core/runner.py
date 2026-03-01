"""Agent runner stub - CrewAI integration point.

This module will contain the core logic for:
- Mapping user-defined personas to CrewAI Agent objects
- Orchestrating multi-agent crews
- Managing agent memory and tool access
- Handling conversation routing
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class AgentConfig:
    """Configuration for a single AI worker."""
    name: str
    role: str
    backstory: str
    goal: str
    tools: list[str] | None = None


async def run_agent(config: AgentConfig, message: str) -> str:
    """Execute an agent with the given config and input message.
    
    TODO: Implement CrewAI integration in Phase 2.
    """
    raise NotImplementedError("Agent execution will be implemented in Phase 2")
