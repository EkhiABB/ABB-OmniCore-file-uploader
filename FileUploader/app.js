// (c) Copyright 2021 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// declare variables in the global scope.
// wait for HTML to finish loading before initiating any components.
window.addEventListener("load", async function () {

    // uncomment line below to enable debug console
    fpComponentsEnableLog();

    // wrap everything in a generic try catch in order to catch any potential error not already caught.
    try {

        let inputFiles = document.getElementById('inputFiles');
        inputFiles.addEventListener('change', inputFilesChanged);

        let status = document.getElementById('pStatus');
        let loading = document.getElementById('divLoader');

        let btnBrowseFiles = new FPComponents.Button_A();
        btnBrowseFiles.attachToId("btnBrowseFiles");
        btnBrowseFiles.text = "Select files to upload";
        btnBrowseFiles.onclick = async function () {
            inputFiles.click();
        };

        let btnClearFiles = new FPComponents.Button_A();
        btnClearFiles.attachToId("btnClearFiles");
        btnClearFiles.text = "Clear selected files";
        clearFiles();
        btnClearFiles.onclick = async function () {
            clearFiles()
        };

        let dorpdownFolder = new FPComponents.Dropdown_A();
        dorpdownFolder.model = await updateFolderList();
        dorpdownFolder.selected = 0;
        dorpdownFolder.desc = "Target folder :"
        dorpdownFolder.attachToId("dorpdownFolder");

        let btnUploadFiles = new FPComponents.Button_A();
        btnUploadFiles.attachToId("btnUploadFiles");
        btnUploadFiles.text = "Upload selected files";
        btnUploadFiles.onclick = async function () {
            btnUploadFiles.enabled = false;
            status.innerText = "Uploading files";
            status.hidden = false;
            loading.hidden = false;
            await uploadFiles();
            loading.hidden = true;
            btnUploadFiles.enabled = true;
            status.innerText = "Upload done!";
            setInterval(
                function () { status.hidden = true; },
                2000
            );
        };

        async function uploadFiles() {
            let targetFolder = '$HOME/';
            if (dorpdownFolder.selected > 0) {
                targetFolder += dorpdownFolder.model.items[dorpdownFolder.selected] + '/';
            }
            let curFiles = inputFiles.files;
            for (let i = 0; i < curFiles.length; i++) {
                let targetFileName = targetFolder + curFiles[i].name;
                let fileContent = await readFile(curFiles[i]);
                console.log(targetFileName)
                let file = await RWS.FileSystem.createFileObject(targetFileName);
                await file.setContents(fileContent);
                await file.save(true);
                console.log("file uploaded");
            }
        }

        function readFile(file) {
            return new Promise((resolve, reject) => {
                let fr = new FileReader();
                fr.onload = x => resolve(fr.result);
                fr.onerrror = reject;
                fr.readAsArrayBuffer(file)
            })
        }


        function inputFilesChanged() {
            let curFiles = inputFiles.files;
            let divSelectedFiles = document.getElementById('divSelectedFiles');
            divSelectedFiles.innerHTML = '';
            const tbl = document.createElement("table");
            const tblBody = document.createElement("tbody");
            for (let i = 0; i < curFiles.length; i++) {
                const row = document.createElement("tr");
                const cell1 = document.createElement("td");
                cell1.appendChild(document.createTextNode(curFiles[i].name));
                row.appendChild(cell1);
                const cell2 = document.createElement("td");
                cell2.appendChild(document.createTextNode(returnFileSize(curFiles[i].size)));
                row.appendChild(cell2);
                tblBody.appendChild(row);
            }
            tbl.appendChild(tblBody);
            divSelectedFiles.appendChild(tbl);
        }

        function clearFiles() {
            inputFiles.value = '';
            let divSelectedFiles = document.getElementById('divSelectedFiles');
            divSelectedFiles.innerHTML = '';
            const tbl = document.createElement("table");
            const tblBody = document.createElement("tbody");
            const row = document.createElement("tr");
            const cell1 = document.createElement("td");
            cell1.appendChild(document.createTextNode("No file selected to upload !"));
            row.appendChild(cell1);
            tblBody.appendChild(row);
            tbl.appendChild(tblBody);
            divSelectedFiles.appendChild(tbl);
        }

        function returnFileSize(number) {
            if (number < 1024) {
                return number + ' octets';
            } else if (number >= 1024 && number < 1048576) {
                return (number / 1024).toFixed(1) + ' Ko';
            } else if (number >= 1048576) {
                return (number / 1048576).toFixed(1) + ' Mo';
            }
        }

        async function updateFolderList() {
            var folderList = { items: [] }
            folderList.items.push("HOME")
            var directory = await RWS.FileSystem.getDirectory('$HOME');
            var contents = await directory.getContents();
            for (let item of contents.directories) {
                folderList.items.push(item.name);
            }
            return folderList;
        }

    } catch (e) {
        var err = JSON.stringify(e);
        console.log(err);
        console.log(e);
        FPComponents.Popup_A.message("Something went wrong!", "Application might not work as intended");
    }

});



// Here we should do things that should happen when app activate.
var appActivate = async function () {
    console.log("appActivate");

    return true;
}

// Here we should do things that should happen right before app deactivates.
var appDeactivate = async function () {
    console.log("appDeactivate");
    return true;
}