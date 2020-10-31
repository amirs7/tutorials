package ir.seyhani.notesbackend;

import ir.seyhani.notesbackend.Note;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface NoteRepository extends CrudRepository<Note, Long> {
}
