function getDefaultLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(x => resolve(x.coords));
        } else {
            resolve(null)
        }
    })
}