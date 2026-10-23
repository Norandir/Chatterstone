# Chatterstone

**Connecting Discord voice activity with Foundry Virtual Tabletop.**

Chatterstone is a software project designed to integrate Discord voice activity with Foundry Virtual Tabletop (VTT). The goal is to display which players are speaking in Discord directly within Foundry, improving the experience of running online tabletop roleplaying games.

The project explores real-time communication between independent applications, Discord integration, and Foundry VTT module development, with an emphasis on security and ease of configuration.

## Project Goals

- Detect player voice activity in Discord and communicate it to Foundry VTT in real time.
- Associate Discord users with their corresponding Foundry player accounts.
- Provide a simple setup process with secure default settings.
- Design the system to support both locally hosted and remotely hosted Foundry installations, where secure connectivity can be established.

## Architecture

Chatterstone is designed around three components:

| Component | Responsibility |
|---|---|
| Discord bot | Detects voice activity and identifies speaking users. |
| Node.js bridge | Receives voice activity events and forwards updates over WebSockets. |
| Foundry VTT module | Receives updates and connects Discord users to Foundry player accounts. |

The components communicate through structured messages, allowing the Discord integration and Foundry module to operate independently.

## Technologies

- JavaScript
- Node.js
- Discord API
- WebSockets
- Foundry Virtual Tabletop module development

## Engineering Challenges

### Real-Time Communication

The project uses WebSockets to transmit voice activity updates between the Node.js bridge and Foundry VTT. This allows changes in speaking state to be communicated without repeatedly polling for updates.

### Cross-Application User Mapping

Discord and Foundry maintain separate user identities. Chatterstone needs a reliable way to associate the two accounts so that voice activity is displayed for the correct player.

### Security and Configuration

A key design consideration is making the system straightforward to configure without requiring users to weaken their network security. The initial approach prioritizes local connections, with remote connectivity treated as a separate problem requiring appropriate authentication and network protections.

### Compatibility with Different Hosting Environments

Foundry VTT can be hosted locally or through a remote hosting provider. Supporting these environments requires consideration of network boundaries and how the browser-based Foundry client communicates with the bridge.

## Current Progress

The initial prototype has established the basic WebSocket communication flow and tested the transmission of voice activity messages.

Current development focuses on completing the Foundry integration, strengthening connection security, handling invalid or unexpected messages, and simplifying configuration.

## Planned Improvements

- Complete speaking indicators in Foundry VTT.
- Improve Discord-to-Foundry user synchronization.
- Implement and test connection authentication.
- Expand error handling and connection lifecycle management.
- Simplify installation and configuration.
- Evaluate secure options for remote Foundry hosting.

## What I'm Learning

This project provides practical experience with real-time event-driven systems, API integration, WebSocket communication, and application security. It also involves designing software that must work across different environments rather than assuming every user has the same hosting setup.

Chatterstone is an ongoing project, with development decisions guided by practical usability, security, and maintainability.
