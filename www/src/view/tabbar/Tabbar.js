(function(){
    App.defineView('Tabbar', {

        options: {
            maxTabWidth: 200
        },

        tagName: "div",
        className: "",

        groupTpl: _.template('<li></li>'),
        groupTabsTpl: _.template('<div class="tab_container"></div>'),

        init: function(){
            var self = this;

            this._tabComponents = {};
            this._disabledTabs = {};
            this._prevIndex = undefined;
            this._currentIndex = undefined;

            this.$el.append($('<ul class="nav nav-tabs tabbar"><li class="dropdown more" style="display: none;"><a href="#">more <b class="caret"></b></a><ul class="dropdown-menu"></ul></li></ul>'));
            this.$el.append($('<div class="tab-content"></div>'));

            this.$el.on('click', "ul.nav-tabs li a.active", function(){
                var index = $(this).parent().data('index');
                if(index || index === 0) {
                    self.activeTab(parseInt(index, 10));
                }
            });
            this.$el.on('click', "ul.nav-tabs li a.tab-close", function(){
                var index = $(this).parent().data('index');
                self.removeTab(index);
            });
            this.$el.on('click', "ul.nav-tabs li.more > a", function(){
                var self = this;
                setTimeout(function(){
                    $(self).parent().addClass('open');
                }, 100);
            });
            $('body').on('click', function() {
                self.$el.find('li.dropdown').removeClass('open');
            });
        },

        doRender: function(){

            var self = this;

            this._groupsMenuEl = this.$el.find('ul.nav-tabs');
            this._groupsTabsEl = this.$el.find('div.tab-content');

            $(window).resize(function() {
                _resize.call(self);
            });

            return this;
        },

        doPresenter: function(){

            if(!this._presenterOnce) {
                this._presenterOnce = true;
            }

        },

        addTab: function(component, label, tabIndex){

            if(!tabIndex) tabIndex = 0;

            var groupEl = _getMenuEl.call(this, tabIndex);
            var moreEl = this._groupsMenuEl.find('.more');
            if(groupEl.length) {
                return this;
            }

            if(groupEl.length===0) {
                groupEl = $(this.groupTpl())
                    .attr('data-index', tabIndex);
                this._groupsMenuEl.children().each(function(){
                    if($(this).data('index')>tabIndex) {
                        groupEl.insertBefore($(this));
                        return false;
                    }
                });
                if(this._groupsMenuEl.has(groupEl).length===0) {
                    groupEl.insertBefore($(moreEl));
                }
            }

            var groupTabsEl = _getTabsEl.call(this, tabIndex);

            if(groupTabsEl.length===0) {
                groupTabsEl = $(this.groupTabsTpl())
                    .attr('data-index', tabIndex);
                this._groupsTabsEl.children().each(function(){
                    if($(this).data('index')>tabIndex) {
                        groupTabsEl.insertBefore($(this));
                        return false;
                    }
                });
                if(this._groupsTabsEl.has(groupTabsEl).length===0) {
                    this._groupsTabsEl.append(groupTabsEl);
                }
            }

            groupEl.append($('<a href="#" class="title active">'+label+'</a><a class="tab-close"></a>'));
            groupTabsEl.append(component.$el);
            this.activeTab(tabIndex);
            this._tabComponents[tabIndex] = component;

            _resize.call(this);

            this.trigger('addtab', tabIndex);

            return this;
        },

        setTitle: function(tabIndex) {
            var groupEl = _getMenuEl.call(this, tabIndex);
            if(!groupEl) {
                return this;
            }

            _resize.call(this);

            return this;
        },

        getTab: function(index) {
            return this._tabComponents[index];
        },

        getTabIndex: function(component) {
            var result = null;
            $.each(this._tabComponents, function(index, value) {
                if(component === value || component === value.$el) {
                    result = index;
                }
            });
            return result;
        },

        removeTab: function(tabIndex) {
            var self = this,
                menuEl = _getMenuEl.call(this, tabIndex),
                tabEl = _getTabsEl.call(this, tabIndex),
                tabsCount = this._groupsMenuEl.children().length;
            if(!menuEl || !tabEl) {
                return this;
            }

            var tabActivated = false;

            this._groupsMenuEl.children().each(function(){
                if(parseInt($(this).data('index'), 10) === parseInt(tabIndex, 10)) {
                    if(tabIndex-1 >= 0) {
                        if(!self._disabledTabs[tabIndex-1]) {
                            self.activeTab(tabIndex-1);
                            tabActivated = true;
                        }
                    } else if(tabIndex+1 < tabsCount) {
                        if(!self._disabledTabs[tabIndex+1]) {
                            self.activeTab(tabIndex+1);
                            tabActivated = true;
                        }
                    }
                }
            });

            if(!tabActivated) {
                var firstTab = this._groupsMenuEl.children()[0];
                self.activeTab($(firstTab).data('index'));
            }

            menuEl.remove();
            tabEl.remove();

            delete this._tabComponents[tabIndex];

            _resize.call(this);

            this.trigger('removetab', tabIndex);

            return this;
        },

        activeTab: function(tabIndex) {
            var menuEl = _getMenuEl.call(this, tabIndex),
                dropdownListEl = $(this._groupsMenuEl).find('ul.dropdown-menu'),
                tabEl = _getTabsEl.call(this, tabIndex);
            if(!menuEl || !tabEl || this._disabledTabs[tabIndex]) {
                return this;
            }

            dropdownListEl.children().each(function(){
                $(this).removeClass('active');
            });

            this._groupsMenuEl.children().each(function(){
                $(this).removeClass('active');
            });
            menuEl.addClass('active');

            this._groupsTabsEl.children().each(function(){
                $(this).hide();
            });
            tabEl.show();

            this._prevIndex = this._currentIndex;
            this._currentIndex = tabIndex;

            _resize.call(this);

            this.trigger('activetab', this._currentIndex, this._prevIndex);

            return this;
        },

        disableTab: function(tabIndex) {
            var menuEl = _getMenuEl.call(this, tabIndex);
            menuEl.find('a').removeClass('active').addClass('disabled');

            this._disabledTabs[tabIndex] = true;

            this.trigger('enablechangetab', tabIndex, false);

            return this;
        },

        enableTab: function(tabIndex) {
            var menuEl = _getMenuEl.call(this, tabIndex);
            menuEl.find('a').addClass('active').removeClass('disabled');

            delete this._disabledTabs[tabIndex];

            this.trigger('enablechangetab', tabIndex, true);

            return this;
        }

    });

    function _getMenuEl(index) {
        return this._groupsMenuEl.find('[data-index='+index+']');
    }
    function _getTabsEl(index) {
        return this._groupsTabsEl.find('[data-index='+index+']');
    }

    function _resize() {
        _fixTabWidths.call(this);
        var self = this,
            menuEl = $(this._groupsMenuEl),
            moreEl = this._groupsMenuEl.find('.more'),
            dropdownListEl = $(this._groupsMenuEl).find('ul.dropdown-menu'),
            menuWidth = menuEl.width(),
            moreEl = this._groupsMenuEl.find('.more'),
            tabsWidth = $(moreEl).width();
        if(!menuWidth) {
            return;
        }

        dropdownListEl.children().each(function(){
            $(this).insertBefore($(moreEl));
        });

        var hiddenTabsCount = 0;
        this._groupsMenuEl.children().each(function(){
            tabsWidth += $(this).width();
            if($(this).attr('class').indexOf('more') == -1) {
                if(tabsWidth > menuWidth) {
                    hiddenTabsCount++;
                    $(this).hide();
                } else {
                    $(this).show();
                }
            }
        });
        if(hiddenTabsCount) {
            moreEl.show();
        } else {
            moreEl.hide();
        }

        this._groupsMenuEl.children().each(function(){
            var isVisible = ($(this).css('display') != 'none');
            if($(this).attr('class').indexOf('more') == -1 && !isVisible) {
                var el = $(this);
                dropdownListEl.append($(this));
            }
        });
        dropdownListEl.children().each(function(){
            $(this).show();
        });
    }

    function _fixTabWidth($el, maxWidth) {
        if($el.width() >= maxWidth) {
            $el.addClass('max_width');
            $el.find('a.title').width(maxWidth);
        } else {
            $el.removeClass('max_width');
            $el.find('a.title').width('auto');
        }
    }

    function _fixTabWidths(index) {
        var self = this,
            maxTabWidth = this.options.maxTabWidth;
        if(index || index === 0) {
            var menuEl = this._groupsMenuEl.find('[data-index='+tabIndex+']');
            _fixTabWidth($(menuEl), maxTabWidth);
        } else {
            this._groupsMenuEl.children().each(function(){
                _fixTabWidth($(this), maxTabWidth);
            });
        }
    }

})();