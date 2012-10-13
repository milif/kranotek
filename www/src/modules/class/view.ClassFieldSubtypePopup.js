(function(){
    App.defineView('ClassFieldSubtypePopup', {

        extend: 'Popup',

        options: {
            popupWidth: 500
        },

        init: function(){
            this.parent().init.apply(this, arguments);
        },
        doRender: function(){
            this.parent().doRender.apply(this, arguments);
            
            var Grid = App.getView('Grid'),
                Button = App.getView('Button'),
            
                addButton = new Button({
                    tooltip: 'Добавить значение',
                    size: 'small',
                    icon: 'icon-plus',
                    click: function(){
                    }
                }),
                removeButton =  new Button({
                    disabled: true,
                    size: 'small',
                    tooltip: 'Удалить значение',
                    icon: 'icon-remove',
                    click: function(){
                        var ids = gridSubtypes.getSelection(),
                            model = gridSubtypes.collection.get(ids[0]);
                        App.msg.okcancel({
                            title: 'Удаление значения',
                            text: 'Вы действительно хотите удалить значение?',
                            callback: function(){    
                                if(model) model.destroy({
                                    wait: true,
                                    silent:false
                                });                                    
                            }
                        });                    
                    }
                }),
                gridSubtypes = new Grid({
                    selectable: true,
                    reorderable: true,
                    columns: [
                        { name: 'Значение', key: 'Value', width: 1 }
                    ],
                    listeners: {
                        'selectionchange': function(id){
                            var model = this.collection.get(id);
                            if(model) {
                                removeButton.enable();
                            } else {
                                removeButton.disable();
                            }
                        },
                        'moverow': function(id, index){
                            var model = this.collection.get(id);
                            if(model) model.changePosition(index);
                        }
                    }
                });            
            
            gridSubtypes.getToolbar()
                .add(addButton, 1)
                .add(removeButton, 2);

            this.add(gridSubtypes);

            this._gridSubtypes = gridSubtypes;

            return this;
        },
        setModel: function(model) {
            if(!model) return;
            this.setTitle('Сабтипы поля ' + model.get('Name'));

            this.model = model;
            
            this._gridSubtypes.setCollection(model.getCollectionSubtypes());
            
            return this;
        }
    });


})();