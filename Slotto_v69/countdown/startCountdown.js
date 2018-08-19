function startCountdown() {
    var date = new Date();
    const deadLineDayOfWeek = getCountdownDayofWeek();
    var deadline = null;
    var dayOfWeek = getDayOfWeek();

    // sunday(0)
    if (dayOfWeek == 0) {
        deadline = date.getNextDayofWeek(deadLineDayOfWeek);
    }
    // monday(1) ~ friday(5)
    else if (dayOfWeek <= getCountdownDayofWeek()) {
        deadline = date.getThisDayofWeek(deadLineDayOfWeek);
    }
    //saturday
    else {
        deadline = date.getNextDayofWeek(deadLineDayOfWeek);
    }

    var timeStamp = deadline.getTime();
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
    var date = new Date();

    date.setUTCHours(21 - 9); // South Korea is 9 hours ahead of Coordinated Universal Time
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    var diff = date.getUTCDate() - date.getUTCDay() + 1;
    if (date.getUTCDay() == 0) {
        diff -= 7;
    }
    return new Date(date.setUTCDate(diff));
};

Date.prototype.getThisDayofWeek = function(dayOfWeek) {
    var d = this.getThisMonday();
    return new Date(d.setUTCDate(d.getUTCDate() + dayOfWeek - 1));
};

Date.prototype.getNextDayofWeek = function(dayOfWeek) {
    var d = this.getThisMonday();
    return new Date(d.setUTCDate(d.getUTCDate() + dayOfWeek - 1 + 7));
};

function getDayOfWeek() {
    var today = new Date();
    return today.getUTCDay();
}