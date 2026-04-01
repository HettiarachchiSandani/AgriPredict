class SupabaseRouter:
    route_app_labels = {'owners', 'batches', 'feed', 'orders', 'predictions', 'reports'}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'supabase'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'supabase'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        db_set = {'supabase', 'default'}
        if obj1._state.db in db_set and obj2._state.db in db_set:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'core':  
            return db == 'default'
        if app_label in self.route_app_labels:
            return db == 'supabase'
        return db == 'default'