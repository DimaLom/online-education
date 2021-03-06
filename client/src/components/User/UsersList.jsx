import React, {
	useState,
	useEffect,
	useCallback,
	useContext,
	useRef,
} from 'react';
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../Loader/Loader';
import { UsersListItem } from './UsersListItem';

import { Form, Button } from 'react-bootstrap';
import { UserItem } from './UserItem';

export const UsersList = () => {
	const { loading, request } = useHttp();
	const [users, setUsers] = useState([]);
	const [user, setUser] = useState(null);
	const [usersGroups, setUsersGroups] = useState([]);
	const [groups, setGroups] = useState([]);
	const [selectedUser, setSelectedUser] = useState('');
	const [userAddGroup, setUserAddGroup] = useState('');
	const [userRemoveGroup, setUserRemoveGroup] = useState('');
	const [findUser, setFindUser] = useState('');
	const { token } = useContext(AuthContext);
	const [form, setForm] = useState({
		name: '',
		email: '',
		user_groups: [],
	});

	const getUsers = useCallback(async () => {
		try {
			const data = await request('/api/user', 'GET', null, {
				Authorization: `Bearer ${token}`,
			});
			setUsers(data);
		} catch (e) {}
	}, [token, request]);

	useEffect(() => {
		getUsers();
	}, [getUsers]);

	const getUsersGroups = useCallback(async () => {
		try {
			const data = await request(`/api/user_groups`, 'GET', null, {
				Authorization: `Bearer ${token}`,
			});
			setUsersGroups(data);
		} catch (e) {}
	}, [token, request]);

	useEffect(() => {
		getUsersGroups();
	}, [getUsersGroups]);

	const getGroups = useCallback(async () => {
		try {
			const data = await request('/api/group', 'GET', null, {
				Authorization: `Bearer ${token}`,
			});
			setGroups(data);
		} catch (e) {}
	}, [token, request]);

	useEffect(() => {
		getGroups();
	}, [getGroups]);

	const getGroupName = (groupId) => {
		let group = [];

		groups.forEach((el) => {
			if (el._id === groupId) {
				group['name'] = el.name;
				group['description'] = el.description;
			}
		});
		return group;
	};

	const getUserGroups = (userId) => {
		const user_groups = usersGroups.filter((group) => group.user_id === userId);
		const userGroupsArr = [];

		if (user_groups[0]) {
			const { group_ids } = user_groups[0];
			group_ids.forEach((id) => {
				const group = getGroupName(id);
				userGroupsArr.push(group);
			});
		}

		return userGroupsArr;
	};

	const changeHandler = (event) => {
		setForm({ ...form, [event.target.name]: event.target.value });
	};

	const saveHandler = async (event) => {
		try {
			await request('/api/user/create', 'POST', { ...form });
			setForm({ name: '', description: '' });
		} catch (e) {}
	};

	const selectUserHandler = (event) => {
		const userId = event.target.closest('span').dataset.id;

		if (userId) {
			const filteredUser = users.find((user) => {
				return user._id === userId;
			});
			if (filteredUser) {
				setUser(filteredUser);
			}
		}
	};

	const findUserHandler = (event) => {
		if (event.key === 'Enter' && findUser) {
			const filteredUser = users.find((user) => {
				return user.email.includes(findUser);
			});
			if (filteredUser) {
				setUser(filteredUser);
			}
		}
	};

	// Продумать оптимизацию filteredUser()

	const addUserToGroupHandler = (event) => {
		setUserAddGroup(event.target.value);
	};

	const removeUserFromGroup = (event) => {
		setUserRemoveGroup(event.target.value);
	};

	const updateUserGroups = useCallback(() => {
		if (user && usersGroups) {
			const user_groups = usersGroups.filter(
				(group) => group.user_id === user._id,
			);

			const userGroupsObj = user_groups[0];

			const checkGroup = (groupId) => {
				if (userGroupsObj.group_ids.length) {
					return userGroupsObj.group_ids.indexOf(groupId);
				}
			};

			if (checkGroup(userAddGroup) < 0 && userAddGroup)
				userGroupsObj.group_ids.push(userAddGroup);

			if (checkGroup(userRemoveGroup) >= 0 && userRemoveGroup)
				userGroupsObj.group_ids.splice(checkGroup(userRemoveGroup), 1);
		}
	}, [user, usersGroups, userAddGroup, userRemoveGroup]);

	useEffect(() => {
		updateUserGroups();
	}, [updateUserGroups]);

	if (loading) {
		return <Loader />;
	}

	return (
		<>
			<div className="widget__wrapper has-shadow">
				<div className="widget__body">
					<UsersListItem
						users={users}
						selectUserHandler={selectUserHandler}
						getUserGroups={getUserGroups}
					/>
				</div>
			</div>

			<div className="widget__wrapper widget__user--update has-shadow">
				<div className="widget__header" id={selectedUser}>
					<Form.Group controlId="findByEmeil" className="form__find-user">
						<Form.Label>Найти пользователя по Email</Form.Label>
						<Form.Control
							type="text"
							name="find_by_emeil"
							value={findUser}
							onChange={(e) => setFindUser(e.target.value)}
							onKeyPress={findUserHandler}
						/>
					</Form.Group>
					<h4 className="widget__title">Редактировать пользователя</h4>
				</div>
				<div className="widget__body">
					{user && <UserItem user={user} getUserGroups={getUserGroups} />}
					<Form className="form__createGroup">
						<Form.Group controlId="inputEditGroup" className="mb-3">
							<Form.Label>Добавить пользователя в группу</Form.Label>
							<Form.Control
								as="select"
								name="user_groups"
								value={userAddGroup}
								onChange={addUserToGroupHandler}
							>
								<option value="">Выберите группу</option>
								{groups.map((el, i) => {
									return (
										<option key={i} value={el._id}>
											{el.name}
										</option>
									);
								})}
							</Form.Control>
						</Form.Group>
						<Form.Group controlId="inputGroup" className="mb-3">
							<Form.Label>Удалить пользователя из группы</Form.Label>
							<Form.Control
								as="select"
								name="user_groups"
								onChange={removeUserFromGroup}
							>
								<option value="">Выберите группу</option>
								{groups.map((el, i) => {
									return (
										<option key={i} value={el._id}>
											{el.name}
										</option>
									);
								})}
							</Form.Control>
						</Form.Group>
						<Button
							className="btn btn-primary btn__gradient btn__grad-danger btn__sign-in"
							type="submit"
							disabled={loading}
							onClick={updateUserGroups}
						>
							Сохранить изменения
						</Button>
					</Form>
				</div>
			</div>

			<div className="widget__wrapper has-shadow">
				<div className="widget__header">
					<h4 className="widget__title">Добавить пользователя</h4>
				</div>
				<div className="widget__body">
					<Form className="form__createGroup">
						<Form.Group controlId="inputName" className="mb-3">
							<Form.Label>Название группы</Form.Label>
							<Form.Control
								type="text"
								name="name"
								value={form.name}
								onChange={changeHandler}
							/>
						</Form.Group>
						<Form.Group controlId="inputDescription" className="mb-3">
							<Form.Label>Описание группы</Form.Label>
							<Form.Control
								type="text"
								name="description"
								value={form.description}
								onChange={changeHandler}
							/>
						</Form.Group>
						<Button
							className="btn btn-primary btn__gradient btn__grad-danger btn__sign-in"
							type="submit"
							onClick={saveHandler}
							disabled={loading}
						>
							Сохранить
						</Button>
					</Form>
				</div>
			</div>
		</>
	);
};
