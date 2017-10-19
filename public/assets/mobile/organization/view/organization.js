function deleteOrg() {
    if (confirm("Are you sure you want to delete this event?")) {
        if (confirm("You can not restore an organization after it is delete. Are you really sure you want to delete this organization?")) {
            sendSimpleRequest('organization/' + ID, 'DELETE', {}, function (error, payload) {
                if (error) {
                    console.log("Internal Error");
                    return;
                }

                if (payload.success) {
                    alert("Organization has been delete");
                    location.href = "../";
                } else {
                    console.log("Internal error");
                }
            });
        }
    }
}

function editOrg(){
    location.href = ID + '/admin';
}

function createEvent_(){
    location.href = ID + "/event";
}