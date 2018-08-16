function startCountdown() {
    var date = new Date();
    var friday = date.getThisFriday();

    var timeStamp = friday.getTime();

    console.log("");
    console.log("deadline: ");
    console.log(new Date(timeStamp));

    const cd = new Countdown({
        cont: document.querySelector('.container'),
        endDate: timeStamp,
        outputTranslation: {
            day: 'Days',
            hour: 'Hours',
            minute: 'Minutes',
            second: 'Seconds',
        },
        endCallback: null,
        outputFormat: 'day|hour|minute|second',
    });
    cd.start();
}

Date.prototype.getThisMonday = function() {
    var d = new Date(this.getTime());
    d.setHours(15);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    var diff = d.getDate() - d.getDay() + 1;
    if (d.getDay() == 0) {
        diff -= 7;
    }
    return new Date(d.setDate(diff));
};

Date.prototype.getThisFriday = function() {
    var d = this.getThisMonday();
    return new Date(d.setDate(d.getDate() + 4));
};