interface Employee{
  uniqueID: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;
  move(employeeID: number,supervisorID: number): void;
  undo(): void;
  redo(): void;
}

class EmployeeOrgApp implements IEmployeeOrgApp {
  public ceo : Employee;
  private history:{ employeeID: number; oldSupervisorID: number }[] = [];
  private future:{ employeeID: number; newSupervisorID: number }[] = [];
  
  private printceo(ceo:Employee,level:number): void {
    console.log(level,ceo.name,`ID${ceo.uniqueID}` );
    for(let i=0;i<ceo.subordinates.length;i++){
      this.printceo(ceo.subordinates[i],level+1);
    } 
  }
  
  private addSubordinate(employee: Employee, supervisorID: number, 
  newEmployee: Employee): boolean {
  	if(employee.uniqueID === supervisorID){
    	employee.subordinates.push(newEmployee);
      return true;
    }
    else{
    	for(let subordinate of employee.subordinates){
      	if(this.addSubordinate(subordinate,supervisorID,newEmployee)){
        return true;
        }
      }
      return false;
    }
  }
  
  private removeSubordinate(employee: Employee, supervisorID: number, 
  deletedEmployeeID: number): boolean{
    if(employee.uniqueID === supervisorID){
      for(let i=0;i<employee.subordinates.length;i++){
      	if(employee.subordinates[i].uniqueID === deletedEmployeeID){
        	employee.subordinates.splice(i,1);
          return true;
        }
      }
    }
    else{
    	for(let subordinate of employee.subordinates){
      	if(this.removeSubordinate(subordinate,supervisorID,deletedEmployeeID)){
        	return true;
        }
      }
    }
    return false;
  }
  
  private findEmployee(employee: Employee,uniqueID:number): Employee | undefined{
  	if(employee.uniqueID === uniqueID){
    	return employee;
    }
    for(let subordinate of employee.subordinates){
      const nestEmployee = this.findEmployee(subordinate,uniqueID);
      if(nestEmployee !== undefined){
      	return nestEmployee;
      } 
    }
    return undefined;
  }
  
  private findSupervisorID(employee: Employee, uniqueID: number): number | undefined{
  	for(let subordinate of employee.subordinates){
    	if(subordinate.uniqueID === uniqueID){
      	return employee.uniqueID;
      }
      
      const id = this.findSupervisorID(subordinate,uniqueID);
      if(id!== undefined){
        return id;
      }
    }
    
    return undefined;
  }
		
  constructor(ceo: Employee){
  	this.ceo = JSON.parse(JSON.stringify(ceo));
  }
   
  printCompleteceo(): void{
   	this.printceo(this.ceo,1);
  }
  
  add(supervisorID: number, newEmployee: Employee): void{
  	this.addSubordinate(this.ceo,supervisorID,newEmployee);
  }
  
  move(employeeID: number,supervisorID: number): void{
    // find if employee exist or not if exist then save in variable
    const employee = this.findEmployee(this.ceo,employeeID);
    if(!employee) return;
  	// now we need to find the current Supervisor ID 
    const oldSupervisorID = this.findSupervisorID(this.ceo,employeeID);
    if(oldSupervisorID === undefined) return;
    
    this.removeSubordinate(this.ceo,oldSupervisorID,employeeID);
    this.addSubordinate(this.ceo,supervisorID,employee);
    
    this.history.push({employeeID,oldSupervisorID});
    this.future = [];
    
  }
  
  undo(): void{
  		if(this.history.length===0) return;
      
  		const {employeeID,oldSupervisorID} = this.history.pop();
      const newSupervisorID = this.findSupervisorID(this.ceo,employeeID);
      if(newSupervisorID === undefined) return;
      
      const emp = this.findEmployee(this.ceo,employeeID);
      if(emp===undefined) return;
      
      this.removeSubordinate(this.ceo,newSupervisorID,employeeID);
      this.addSubordinate(this.ceo,oldSupervisorID,emp);
      
      this.future.push({employeeID,newSupervisorID});
  }
  
  redo(): void{
  		if(this.future.length===0) return;
      
      const {employeeID,newSupervisorID} = this.future.pop();
      const oldSupervisorID = this.findSupervisorID(this.ceo,employeeID);
      if(oldSupervisorID === undefined) return;
      
      const emp = this.findEmployee(this.ceo,employeeID);
      if(emp===undefined) return;
      
      this.removeSubordinate(this.ceo,oldSupervisorID,employeeID);
      this.addSubordinate(this.ceo,newSupervisorID,emp);
      
      this.history.push({employeeID,oldSupervisorID});
  }
  
}

const ceo: Employee =  {
uniqueID: 1,
name: "John Smith",
subordinates: []
}


const A: Employee =  {
uniqueID: 2,
name: "Margot Donald",
subordinates: []
}


const B: Employee =  {
uniqueID: 3,
name: "Tyler Simpson",
subordinates: []
}

const C: Employee =  {
uniqueID: 4,
name: "Cassandra Reynolds",
subordinates: []
}

const app = new EmployeeOrgApp(ceo);
 app.add(1,A);
app.add(1,B);
app.add(2,C);
 console.log('before');
 app.printCompleteceo();  
app.move(2,3);
console.log('after move');
app.printCompleteceo();  
  app.undo();
console.log('after undo');
app.printCompleteceo();   
 app.redo();
 console.log('after redo');
 app.printCompleteceo();   

 



