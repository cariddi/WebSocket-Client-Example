import { Manager, Socket } from "socket.io-client";
import { ClientEvents, ServerEvents, ServerMsgPayload } from "./interfaces";

let socket: Socket;

export const connectToServer = (token: string) => {
	const manager = new Manager("localhost:3000/socket.io/socket.io.js", {
		extraHeaders: {
			authentication: token,
		},
	});

	socket?.removeAllListeners();
	socket = manager.socket("/"); // the param is namespace

	addListeners();
};

const addListeners = () => {
	const serverStatusLabel =
		document.querySelector<HTMLSpanElement>("#server-status")!;
	const clientsUl = document.querySelector<HTMLUListElement>("#clients-ul")!;
	const messageForm = document.querySelector<HTMLFormElement>("#message-form")!;
	const messageInput =
		document.querySelector<HTMLInputElement>("#message-input")!;
	const messagesUl = document.querySelector<HTMLUListElement>("#messages-ul")!;

	// we use the 'on' callback to listen to server events
	socket.on(ServerEvents.Connect, () => {
		serverStatusLabel.innerHTML = "connected";
	});

	socket.on(ServerEvents.Disconnect, () => {
		serverStatusLabel.innerHTML = "disconnected";
	});

	socket.on(ServerEvents.ClientsUpdated, (clients: string[]) => {
		let clientsHTML = "";

		clients.forEach((clientId) => {
			clientsHTML += `
        <li>${clientId}</li>
      `;
		});

		clientsUl.innerHTML = clientsHTML;
	});

	messageForm.addEventListener("submit", (event) => {
		event.preventDefault();
		if (messageInput.value.trim().length <= 0) return;

		const clientMsg = { id: "I", message: messageInput.value };
		socket.emit(ClientEvents.ClientMsg, clientMsg);

		messageInput.value = "";
	});

	socket.on(
		ServerEvents.ServerMsg,
		({ fullName, message }: ServerMsgPayload) => {
			const newMsgHtml = `
        <li>
          <strong>${fullName}</strong>
          <span>${message}</span>
        </li>
    `;

			const li = document.createElement("li");
			li.innerHTML = newMsgHtml;

			messagesUl.append(li);
		}
	);
};
