function deleteEvent_(){
    if(confirm("Are you sure you want to delete this event?")){
        if(confirm("You can not restore an event after it's deleted. Are you really sure you want to delete this event?")){
            sendSimpleRequest('event/' + ID, 'DELETE', {}, function (err, payload) {
                if (err) {
                    console.log("INTERNAL ERROR");
                    return;
                }

                if (payload.success) {
                    setTimeout(function () {
                        location.href = '../';
                    }, 250);
                } else {
                    console.dir(payload);
                }
            });
        }
    }
}