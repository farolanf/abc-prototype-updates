import { combineReducers } from 'redux';
import authReducer from './auth.reducer';
import appdataReducer from './appdata.reducer';
import dashboardReducer from './dashboard.reducer';
import usersReducer from './users.reducer';
import lookupReducer from './lookup.reducer';
import settingReducer from './setting.reducer';
import creationReducer from './creation.reducer';

const allReducers = combineReducers({ authReducer, appdataReducer, dashboardReducer, usersReducer, lookupReducer, settingReducer, creationReducer});

export default allReducers;
