module.exports = {
		actions :{
			use : [],
			add :function(params){
				trace("Action : add2");
				if(!params.name || params.name.length < 3){
					this.error = "Enter task with minimum 3 symbols! You lazy!";
					yield this.retry();
					return;
				}
				this.error = undefined;
				this.todos.push({
					id: this.todos.length,
					text: params.name,
					resolved :false,
				});
			},
			remove : function(params){
				trace("Action : remove");
				let [,index] =  params.action;
				this.todos.splice(index, 1);
			},
			resolve : function(params){
				trace("Action : resolve");
				let [,index] =  params.action;
				let target = this.todos[index];
				if(!!target){target.resolved = true;}
			},
			removeResolved : function(params){
				trace("Action : removeResolved");
				this.todos = this.todos.filter(function (current){
					return !current.resolved;
				});
			},
		}
}