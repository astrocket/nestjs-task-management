// feature
class FriendsList {
  friends = [];

  addFriend(name) {
    this.friends.push(name);
    this.announceFriendship(name);
  }

  announceFriendship(name) {
    global.console.log(`${name} is now a friend!`);
  }

  removeFriend(name) {
    const idx = this.friends.indexOf(name);

    if (idx === -1) {
      throw new Error('Friend not found!');
    }

    this.friends.splice(idx, 1);
  }
}

// tests
describe('FriendsList', () => {
  let friendsList;

  beforeEach(() => {
    friendsList = new FriendsList();
  });

  it('initializes friends list', () => {
    expect(friendsList.friends.length).toEqual(0);
  });

  // 이미 테스트 한 intialize 스텝을 를 다시 테스트 하지는 않는다.
  it('adds a friend to the list', () => {
    friendsList.addFriend('Astro');
    expect(friendsList.friends.length).toEqual(1);
  });

  it('announces friendship', () => {
    friendsList.announceFriendship = jest.fn(); // mock function
    expect(friendsList.announceFriendship).not.toHaveBeenCalled();
    friendsList.addFriend('Astro');
    expect(friendsList.announceFriendship).toHaveBeenCalled();
    expect(friendsList.announceFriendship).toHaveBeenCalledWith('Astro');
  });

  // 2가지 경우가 발생가능 한 코드의 테스트
  describe('removeFriend', () => {
    it('removes a friend from the list', () => {
      friendsList.addFriend('Astro');
      expect(friendsList.friends[0]).toEqual('Astro');
      friendsList.removeFriend('Astro');
      expect(friendsList.friends[0]).toBeUndefined();
    });

    it('throws an error as friend does not exist', () => {
      expect(() => friendsList.removeFriend('Astro')).toThrow();
      expect(() => friendsList.removeFriend('Astro')).toThrow(Error);
      expect(() => friendsList.removeFriend('Astro')).toThrow(new Error('Friend not found!'));
    });
  });
});
