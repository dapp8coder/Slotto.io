function startCountdown() {
    var date = new Date();
    const deadLineDayOfWeek = 5;
    var deadline = null;
    var dayOfWeek = getDayOfWeek();

    if (dayOfWeek <= deadLineDayOfWeek) {
        deadline = date.getThisDayofWeek(deadLineDayOfWeek);
    } else {
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

function whatDayIsToday() {
    console.log("");
    console.log("today is " + getNameDayOfWeek() + " (utc)");
}

function getNameDayOfWeek() {
    var today = new Date();
    switch (today.getUTCDay()) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
    }
}

function getDayOfWeek() {
    var today = new Date();
    return today.getUTCDay();
}