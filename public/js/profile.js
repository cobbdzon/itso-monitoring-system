function getUserIdFromCurrentUrl() {
	const path = window.location.pathname;
	return path.split("/").pop();
}

function handleChangeUsername() {
	const changeUsername_dialogBox = document.getElementById(
		"changeusername_dialogbox"
	);
	if (!changeUsername_dialogBox) return;

	const usernameTextboxContainer =
		changeUsername_dialogBox.getElementsByClassName("textbox")[0];
	const usernameTextbox =
		usernameTextboxContainer.getElementsByTagName("input")[0];

	const dialogButtons =
		changeUsername_dialogBox.getElementsByClassName("buttons")[0];
	const cancelButton = dialogButtons.getElementsByClassName("no")[0];
	const acceptButton = dialogButtons.getElementsByClassName("yes")[0];

	const changeUsernameButton = document.getElementById("changeusername");

	var isValid = false;
	function checkIfValid() {
		isValid = /^[a-zA-Z][a-zA-Z0-9_\ ]*$/.test(usernameTextbox.value);
		if (isValid) {
			usernameTextbox.setAttribute("valid", "true");
		} else {
			usernameTextbox.setAttribute("valid", "false");
		}
	}

	checkIfValid();
	usernameTextbox.onkeydown = checkIfValid;

	changeUsernameButton.onclick = () => {
		changeUsername_dialogBox.style.display = "initial";
	};

	cancelButton.onclick = () => {
		changeUsername_dialogBox.style.display = "none";
	};

	acceptButton.onclick = () => {
		checkIfValid();
		if (!isValid) return;
		fetch(`/api/changeusername/${getUserIdFromCurrentUrl()}`, {
			method: "POST",
			body: JSON.stringify({
				newUsername: usernameTextbox.value,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((res) => {
				console.log(res);
				location.reload();
			})
			.catch((err) => {
				console.error(err);
			});
	};
}

function handleDeleteUser() {
	const deleteUser_dialogBox = document.getElementById("deleteuser_dialogbox");
	if (!deleteUser_dialogBox) return;

	const dialogButtons =
		deleteUser_dialogBox.getElementsByClassName("buttons")[0];
	const cancelButton = dialogButtons.getElementsByClassName("no")[0];
	const acceptButton = dialogButtons.getElementsByClassName("yes")[0];

	const deleteUserButton = document.getElementById("deleteuser");

	deleteUserButton.onclick = () => {
		deleteUser_dialogBox.style.display = "initial";
	};

	cancelButton.onclick = () => {
		deleteUser_dialogBox.style.display = "none";
	};

	acceptButton.onclick = () => {
		fetch(`/api/deleteuser/${getUserIdFromCurrentUrl()}`, {
			method: "POST",
		})
			.then((res) => {
				console.log(res);
				location.reload();
			})
			.catch((err) => {
				console.error(err);
			});
	};
}

document.addEventListener("DOMContentLoaded", () => {
	handleChangeUsername();
	handleDeleteUser();
});
