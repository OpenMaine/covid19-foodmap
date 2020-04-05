function getDefaultLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(x => resolve(x.coords), (err) => resolve(null));
        } else {
            resolve(null)
        }
    }, (err) => {
        resolve(null);
    });
}