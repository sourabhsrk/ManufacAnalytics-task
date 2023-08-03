var EmployeeOrgApp = /** @class */ (function () {
    function EmployeeOrgApp(ceo) {
        this.history = [];
        this.future = [];
        this.ceo = JSON.parse(JSON.stringify(ceo));
    }
    EmployeeOrgApp.prototype.printceo = function (ceo, level) {
        console.log(level, ceo.name, "ID".concat(ceo.uniqueID));
        for (var i = 0; i < ceo.subordinates.length; i++) {
            this.printceo(ceo.subordinates[i], level + 1);
        }
    };
    EmployeeOrgApp.prototype.addSubordinate = function (employee, supervisorID, newEmployee) {
        if (employee.uniqueID === supervisorID) {
            employee.subordinates.push(newEmployee);
            return true;
        }
        else {
            for (var _i = 0, _a = employee.subordinates; _i < _a.length; _i++) {
                var subordinate = _a[_i];
                if (this.addSubordinate(subordinate, supervisorID, newEmployee)) {
                    return true;
                }
            }
            return false;
        }
    };
    EmployeeOrgApp.prototype.removeSubordinate = function (employee, supervisorID, deletedEmployeeID) {
        if (employee.uniqueID === supervisorID) {
            for (var i = 0; i < employee.subordinates.length; i++) {
                if (employee.subordinates[i].uniqueID === deletedEmployeeID) {
                    employee.subordinates.splice(i, 1);
                    return true;
                }
            }
        }
        else {
            for (var _i = 0, _a = employee.subordinates; _i < _a.length; _i++) {
                var subordinate = _a[_i];
                if (this.removeSubordinate(subordinate, supervisorID, deletedEmployeeID)) {
                    return true;
                }
            }
        }
        return false;
    };
    EmployeeOrgApp.prototype.findEmployee = function (employee, uniqueID) {
        if (employee.uniqueID === uniqueID) {
            return employee;
        }
        for (var _i = 0, _a = employee.subordinates; _i < _a.length; _i++) {
            var subordinate = _a[_i];
            var nestEmployee = this.findEmployee(subordinate, uniqueID);
            if (nestEmployee !== undefined) {
                return nestEmployee;
            }
        }
        return undefined;
    };
    EmployeeOrgApp.prototype.findSupervisorID = function (employee, uniqueID) {
        for (var _i = 0, _a = employee.subordinates; _i < _a.length; _i++) {
            var subordinate = _a[_i];
            if (subordinate.uniqueID === uniqueID) {
                return employee.uniqueID;
            }
            var id = this.findSupervisorID(subordinate, uniqueID);
            if (id !== undefined) {
                return id;
            }
        }
        return undefined;
    };
    EmployeeOrgApp.prototype.printCompleteceo = function () {
        this.printceo(this.ceo, 1);
    };
    EmployeeOrgApp.prototype.add = function (supervisorID, newEmployee) {
        this.addSubordinate(this.ceo, supervisorID, newEmployee);
    };
    EmployeeOrgApp.prototype.remove = function (supervisorID, deletedEmployeeID) {
        this.removeSubordinate(this.ceo, supervisorID, deletedEmployeeID);
    };
    EmployeeOrgApp.prototype.move = function (employeeID, supervisorID) {
        // find if employee exist or not if exist then save in variable
        var employee = this.findEmployee(this.ceo, employeeID);
        if (!employee)
            return;
        // now we need to find the current Supervisor ID 
        var oldSupervisorID = this.findSupervisorID(this.ceo, employeeID);
        if (oldSupervisorID === undefined)
            return;
        this.removeSubordinate(this.ceo, oldSupervisorID, employeeID);
        this.addSubordinate(this.ceo, supervisorID, employee);
        this.history.push({ employeeID: employeeID, oldSupervisorID: oldSupervisorID });
        this.future = [];
    };
    EmployeeOrgApp.prototype.undo = function () {
        if (this.history.length === 0)
            return;
        var _a = this.history.pop(), employeeID = _a.employeeID, oldSupervisorID = _a.oldSupervisorID;
        var newSupervisorID = this.findSupervisorID(this.ceo, employeeID);
        if (newSupervisorID === undefined)
            return;
        var emp = this.findEmployee(this.ceo, employeeID);
        if (emp === undefined)
            return;
        this.removeSubordinate(this.ceo, newSupervisorID, employeeID);
        this.addSubordinate(this.ceo, oldSupervisorID, emp);
        this.future.push({ employeeID: employeeID, newSupervisorID: newSupervisorID });
    };
    EmployeeOrgApp.prototype.redo = function () {
        if (this.future.length === 0)
            return;
        var _a = this.future.pop(), employeeID = _a.employeeID, newSupervisorID = _a.newSupervisorID;
        var oldSupervisorID = this.findSupervisorID(this.ceo, employeeID);
        if (oldSupervisorID === undefined)
            return;
        var emp = this.findEmployee(this.ceo, employeeID);
        if (emp === undefined)
            return;
        this.removeSubordinate(this.ceo, oldSupervisorID, employeeID);
        this.addSubordinate(this.ceo, newSupervisorID, emp);
        this.history.push({ employeeID: employeeID, oldSupervisorID: oldSupervisorID });
    };
    return EmployeeOrgApp;
}());
var ceo = {
    uniqueID: 1,
    name: "John Smith",
    subordinates: []
};
var A = {
    uniqueID: 2,
    name: "Margot Donald",
    subordinates: []
};
var B = {
    uniqueID: 3,
    name: "Tyler Simpson",
    subordinates: []
};
var C = {
    uniqueID: 4,
    name: "Cassandra Reynolds",
    subordinates: []
};
var app = new EmployeeOrgApp(ceo);
app.add(1, A);
app.add(1, B);
app.add(2, C);
console.log('before');
app.printCompleteceo();
app.move(2, 3);
console.log('after move');
app.printCompleteceo();
app.undo();
console.log('after undo');
app.printCompleteceo();
app.redo();
console.log('after redo');
app.printCompleteceo();
